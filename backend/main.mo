import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Map "mo:core/Map";
import Char "mo:core/Char";
import Principal "mo:core/Principal";
import Iter "mo:core/Iter";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();
  type LayoutSettings = {
    headerColor : Text;
    footerText : Text;
    showQrCode : Bool;
    qrPayload : Text;
    showWatermark : Bool;
    watermarkText : Text;
    watermarkOpacity : Nat;
    signatureLayout : { #stacked; #sideBySide };
    footerLayout : { #centered; #twoColumn };
  };
  type GlobalMasterTemplate = {
    adminId : Text;
    businessName : Text;
    businessAddress : Text;
    optionalCustomFieldLabel : ?Text;
    optionalCustomFieldValue : ?Text;
    logo : ?Storage.ExternalBlob;
    stamp : ?Storage.ExternalBlob;
    signature : ?Storage.ExternalBlob;
    layout : LayoutSettings;
  };
  type DocumentContent = {
    title : Text;
    body : Text;
    adminId : Text;
  };
  public type UserProfile = {
    name : Text;
    email : ?Text;
  };
  type Document = {
    adminId : Text;
    documentType : Text;
    content : DocumentContent;
    template : GlobalMasterTemplate;
  };
  let templatesMap = Map.empty<Text, GlobalMasterTemplate>();
  let documentContentsMap = Map.empty<Text, Map.Map<Text, DocumentContent>>();
  let documentsMap = Map.empty<Text, Map.Map<Text, Document>>();
  var nextDocumentId = 1;
  let userProfiles = Map.empty<Principal, UserProfile>();

  func validateNonEmptyField(fieldName : Text, text : Text) {
    let isEmpty = text.isEmpty();
    if (isEmpty) {
      Runtime.trap("Validation failed: " # fieldName # " cannot be empty.");
    };
  };

  // User profile functions required by the frontend
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get their profile");
    };
    userProfiles.get(caller);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  // Fetch global template - accessible to authenticated users
  public query ({ caller }) func getGlobalTemplate(adminId : Text) : async ?GlobalMasterTemplate {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view templates");
    };
    templatesMap.get(adminId);
  };

  // Update global template - only the owning admin or a system admin can update
  public shared ({ caller }) func updateGlobalTemplate(
    adminId : Text,
    template : GlobalMasterTemplate,
  ) : async () {
    if (not isCallerAuthorizedForAdmin(caller, adminId)) {
      Runtime.trap("Unauthorized: You are not authorized to update the template for this adminId");
    };
    templatesMap.add(adminId, template);
  };

  // Get document content - accessible to authenticated users
  public query ({ caller }) func getDocumentContent(adminId : Text, docType : Text) : async ?DocumentContent {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view document content");
    };
    switch (documentContentsMap.get(adminId)) {
      case (null) {
        Runtime.trap("Content not found for adminId: " # adminId);
      };
      case (?contents) {
        contents.get(docType);
      };
    };
  };

  func isCallerAuthorizedForAdmin(caller : Principal, adminId : Text) : Bool {
    let userRole : AccessControl.UserRole = AccessControl.getUserRole(accessControlState, caller);
    switch (userRole) {
      case (#admin) {
        true;
      };
      case (#user) {
        switch (userProfiles.get(caller)) {
          case (null) { false };
          case (?profile) {
            switch (profile.name == adminId) {
              case (true) { true };
              case (false) { false };
            };
          };
        };
      };
      case (_) { false };
    };
  };

  // Update multiple document types - only the owning admin or a system admin
  public shared ({ caller }) func updateMultipleDocumentTypes(adminId : Text, docTypeContentList : [(Text, DocumentContent)]) : async () {
    if (not isCallerAuthorizedForAdmin(caller, adminId)) {
      Runtime.trap("Unauthorized: You are not authorized to manage content for this adminId");
    };
    var documentContents = Map.empty<Text, DocumentContent>();
    let existingContents = documentContentsMap.get(adminId);
    switch (existingContents) {
      case (null) {
        for ((docType, content) in docTypeContentList.values()) {
          documentContents.add(docType, content);
        };
      };
      case (?existingContents) {
        for ((docType, content) in docTypeContentList.values()) {
          existingContents.remove(docType);
          documentContents.add(docType, content);
        };
        for ((docType, content) in existingContents.entries()) {
          if (not documentContents.containsKey(docType)) {
            documentContents.add(docType, content);
          };
        };
      };
    };

    documentContentsMap.add(adminId, documentContents);
  };

  // Get all document contents - accessible to authenticated users
  public query ({ caller }) func getAllDocumentContents(adminId : Text) : async {
    businessTemplates : ?GlobalMasterTemplate;
    contents : [Text];
  } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view document contents");
    };
    switch (documentContentsMap.get(adminId)) {
      case (null) {
        Runtime.trap("Content not found for adminId: " # adminId);
      };
      case (?contents) {
        let contentList : [Text] = contents.keys().toArray();
        {
          businessTemplates = templatesMap.get(adminId);
          contents = contentList;
        };
      };
    };
  };

  // Convert document to template - only the owning admin or a system admin
  public shared ({ caller }) func convertDocumentToTemplate(documentId : Text) {
    let documentFolder = switch (documentsMap.get(documentId)) {
      case (null) {
        Map.empty<Text, Document>();
      };
      case (?existingFolder) {
        existingFolder;
      };
    };

    switch (documentFolder.get(documentId)) {
      case (null) {
        Runtime.trap("Document not found with id: " # documentId);
      };
      case (?document) {
        if (not isCallerAuthorizedForAdmin(caller, document.adminId)) {
          Runtime.trap("Unauthorized: You are not authorized to convert documents for this adminId");
        };
        let documentContent = extractDocumentContent(document);
        switch (documentContentsMap.get(document.adminId)) {
          case (null) {
            let newContentFolder = Map.empty<Text, DocumentContent>();
            newContentFolder.add(document.documentType, documentContent);
            documentContentsMap.add(document.adminId, newContentFolder);
          };
          case (?existingContentFolder) {
            existingContentFolder.add(document.documentType, documentContent);
          };
        };
      };
    };
  };

  func extractDocumentContent(document : Document) : DocumentContent {
    {
      title = document.content.title;
      body = document.content.body;
      adminId = document.adminId;
    };
  };
};
