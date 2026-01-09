/**
 * MongoDB script to add default camera WebSocket settings to all companies
 * 
 * Usage in MongoDB Shell (mongosh):
 *   load('scripts/add-camera-settings.mongodb.js')
 * 
 * Or copy-paste the code below into mongosh
 */

// Default camera settings
const defaultCameraSettings = {
  camera1Ip: "192.168.1.50",
  camera1HttpPort: 443,
  camera1RtspPort: 8557,
  camera1WebSocketPort: 8557,  // Real-time video WebSocket port
  camera1Username: "admin",
  camera1Password: "admin",
  camera2Ip: "192.168.1.49",
  camera2HttpPort: 443,
  camera2RtspPort: 8557,
  camera2WebSocketPort: 8557,  // Real-time video WebSocket port
  camera2Username: "admin",
  camera2Password: "admin"
};

// Find all companies without cameraSettings
const companiesWithoutSettings = db.companies.find({
  $or: [
    { cameraSettings: { $exists: false } },
    { cameraSettings: null }
  ]
});

let updated = 0;
let skipped = 0;

companiesWithoutSettings.forEach((company) => {
  const companyId = company.companyId;
  
  if (!companyId) {
    print(`⚠️  Skipping company without companyId: ${company._id}`);
    skipped++;
    return;
  }

  const result = db.companies.updateOne(
    { companyId: companyId },
    {
      $set: {
        cameraSettings: defaultCameraSettings,
        updatedAt: new Date()
      }
    }
  );

  if (result.modifiedCount > 0) {
    print(`✅ Added camera settings to company: ${companyId}`);
    updated++;
  } else {
    print(`⚠️  Company ${companyId} not updated`);
    skipped++;
  }
});

print("\n📊 Summary:");
print(`   ✅ Updated: ${updated}`);
print(`   ⏭️  Skipped: ${skipped}`);
print(`   📝 Total companies checked: ${db.companies.countDocuments({})}`);

if (updated > 0) {
  print("\n✅ Successfully added camera settings to companies!");
} else {
  print("\n⚠️  No companies were updated. They may already have camera settings.");
}
