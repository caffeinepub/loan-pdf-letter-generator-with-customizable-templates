import Text "mo:core/Text";
import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  public type LoanType = {
    #home;
    #personal;
    #business;
    #vehicle;
    #education;
  };

  public type LoanProcessingData = {
    id : Text;
    amount : Nat;
    loanType : LoanType;
    processingCharge : Nat;
    timestamp : Int;
  };

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
  public type TemplateResult = {
    #success;
    #alreadyExists;
    #notFound;
    #unauthorizedField;
    #unexpectedError : Text;
  };
  let templatesMap = Map.empty<Text, GlobalMasterTemplate>();
  let documentContentsMap = Map.empty<Text, Map.Map<Text, DocumentContent>>();
  let documentsMap = Map.empty<Text, Map.Map<Text, Document>>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let loanProcessingRecords = Map.empty<Text, LoanProcessingData>();
  let customTemplates = Map.empty<Text, GlobalMasterTemplate>();
  let customTemplateOwners = Map.empty<Text, Principal>();

  ///////////////////////////////////////
  // User Profile Functions
  ///////////////////////////////////////
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get their profile");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  ///////////////////////////////////////
  // Template Functions
  ///////////////////////////////////////
  public query ({ caller }) func getGlobalTemplate(adminId : Text) : async ?GlobalMasterTemplate {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view templates");
    };
    templatesMap.get(adminId);
  };

  public shared ({ caller }) func updateGlobalTemplate(
    adminId : Text,
    template : GlobalMasterTemplate,
  ) : async () {
    if (not isCallerAuthorizedForAdmin(caller, adminId)) {
      Runtime.trap("Unauthorized: You are not authorized to update the template for this adminId");
    };
    templatesMap.add(adminId, template);
  };

  ///////////////////////////////////////
  // Document Content Functions
  ///////////////////////////////////////
  public query ({ caller }) func getDocumentContent(adminId : Text, docType : Text) : async ?DocumentContent {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view document content");
    };
    switch (documentContentsMap.get(adminId)) {
      case (null) { Runtime.trap("Content not found for adminId: " # adminId) };
      case (?contents) { contents.get(docType) };
    };
  };

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

  public query ({ caller }) func getAllDocumentContents(adminId : Text) : async {
    businessTemplates : ?GlobalMasterTemplate;
    contents : [Text];
  } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view document contents");
    };
    switch (documentContentsMap.get(adminId)) {
      case (null) { Runtime.trap("Content not found for adminId: " # adminId) };
      case (?contents) {
        let contentList : [Text] = contents.keys().toArray();
        {
          businessTemplates = templatesMap.get(adminId);
          contents = contentList;
        };
      };
    };
  };

  ///////////////////////////////////////
  // Custom Templates Functions
  ///////////////////////////////////////
  public query ({ caller }) func getAllTemplates() : async [GlobalMasterTemplate] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view templates");
    };
    customTemplates.values().toArray();
  };

  public query ({ caller }) func getCustomTemplateById(templateId : Text) : async ?GlobalMasterTemplate {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view templates");
    };
    customTemplates.get(templateId);
  };

  public shared ({ caller }) func addCustomTemplate(templateId : Text, template : GlobalMasterTemplate) : async TemplateResult {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      return #unauthorizedField;
    };
    if (customTemplates.containsKey(templateId)) {
      return #alreadyExists;
    };
    customTemplates.add(templateId, template);
    customTemplateOwners.add(templateId, caller);
    #success;
  };

  public shared ({ caller }) func updateCustomTemplate(templateId : Text, template : GlobalMasterTemplate) : async TemplateResult {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      return #unauthorizedField;
    };
    if (not customTemplates.containsKey(templateId)) {
      return #notFound;
    };
    let isOwner = switch (customTemplateOwners.get(templateId)) {
      case (null) { false };
      case (?owner) { owner == caller };
    };
    if (not isOwner and not AccessControl.isAdmin(accessControlState, caller)) {
      return #unauthorizedField;
    };
    customTemplates.add(templateId, template);
    #success;
  };

  func isCallerAuthorizedForAdmin(caller : Principal, adminId : Text) : Bool {
    switch (AccessControl.getUserRole(accessControlState, caller)) {
      case (#admin) { true };
      case (#user) {
        switch (userProfiles.get(caller)) {
          case (null) { false };
          case (?profile) { profile.name == adminId };
        };
      };
      case (_) { false };
    };
  };

  ///////////////////////////////////////
  // Loan Processing Functions
  ///////////////////////////////////////
  public shared ({ caller }) func createLoanProcessingRecord(record : LoanProcessingData) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create loan processing records");
    };
    loanProcessingRecords.add(record.id, record);
  };

  public query ({ caller }) func getLoanProcessingRecord(id : Text) : async ?LoanProcessingData {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view loan processing records");
    };
    loanProcessingRecords.get(id);
  };

  public shared ({ caller }) func updateLoanProcessingRecord(id : Text, update : LoanProcessingData) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update loan processing records");
    };
    if (not loanProcessingRecords.containsKey(id)) {
      Runtime.trap("Loan processing record not found: " # id);
    };
    loanProcessingRecords.add(id, update);
  };

  public shared ({ caller }) func deleteLoanProcessingRecord(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete loan processing records");
    };
    loanProcessingRecords.remove(id);
  };

  public query ({ caller }) func getAllLoanProcessingRecords() : async [LoanProcessingData] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view loan processing records");
    };
    loanProcessingRecords.values().toArray();
  };
};

