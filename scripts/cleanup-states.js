import mongoose from 'mongoose';

// State mapping to extract only state names
const stateMapping = {
  'sydney_nsw': 'New South Wales',
  'melbourne_vic': 'Victoria', 
  'brisbane_qld': 'Queensland',
  'perth_wa': 'Western Australia',
  'adelaide_sa': 'South Australia',
  'hobart_tas': 'Tasmania',
  'darwin_nt': 'Northern Territory',
  'canberra_act': 'Australian Capital Territory',
  // Handle cases where underscores are replaced with spaces
  'sydney nsw': 'New South Wales',
  'melbourne vic': 'Victoria',
  'brisbane qld': 'Queensland', 
  'perth wa': 'Western Australia',
  'adelaide sa': 'South Australia',
  'hobart tas': 'Tasmania',
  'darwin nt': 'Northern Territory',
  'canberra act': 'Australian Capital Territory',
  // Handle cases with different formatting
  'melbourne vic': 'Victoria',
  'sydney nsw': 'New South Wales',
  // Add more mappings as needed
};

// Function to clean state name
function cleanStateName(stateValue) {
  if (!stateValue) return stateValue;
  
  // Check if it's a known city-state combination
  if (stateMapping[stateValue.toLowerCase()]) {
    return stateMapping[stateValue.toLowerCase()];
  }
  
  // Try to extract state from common patterns
  const patterns = [
    /.*\s+(nsw|new south wales)$/i,
    /.*\s+(vic|victoria)$/i,
    /.*\s+(qld|queensland)$/i,
    /.*\s+(wa|western australia)$/i,
    /.*\s+(sa|south australia)$/i,
    /.*\s+(tas|tasmania)$/i,
    /.*\s+(nt|northern territory)$/i,
    /.*\s+(act|australian capital territory)$/i,
  ];
  
  const stateAbbreviations = {
    'nsw': 'New South Wales',
    'new south wales': 'New South Wales',
    'vic': 'Victoria',
    'victoria': 'Victoria',
    'qld': 'Queensland',
    'queensland': 'Queensland',
    'wa': 'Western Australia',
    'western australia': 'Western Australia',
    'sa': 'South Australia',
    'south australia': 'South Australia',
    'tas': 'Tasmania',
    'tasmania': 'Tasmania',
    'nt': 'Northern Territory',
    'northern territory': 'Northern Territory',
    'act': 'Australian Capital Territory',
    'australian capital territory': 'Australian Capital Territory',
  };
  
  for (const pattern of patterns) {
    const match = stateValue.match(pattern);
    if (match) {
      const statePart = match[1].toLowerCase();
      return stateAbbreviations[statePart] || stateValue;
    }
  }
  
  return stateValue;
}

async function cleanupStates() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/kindora';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');
    
    // Get the volunteer profile model
    const VolunteerProfile = mongoose.model('volunteer_profile', new mongoose.Schema({}));
    const OrganizationProfile = mongoose.model('organization_profile', new mongoose.Schema({}));
    
    // Clean up volunteer profiles
    console.log('Cleaning up volunteer profiles...');
    const volunteerProfiles = await VolunteerProfile.find({});
    let volunteerUpdates = 0;
    
    for (const profile of volunteerProfiles) {
      const oldState = profile.state;
      const newState = cleanStateName(oldState);
      
      if (oldState !== newState) {
        await VolunteerProfile.updateOne(
          { _id: profile._id },
          { $set: { state: newState } }
        );
        console.log(`Volunteer ${profile._id}: "${oldState}" -> "${newState}"`);
        volunteerUpdates++;
      }
    }
    
    // Clean up organization profiles
    console.log('Cleaning up organization profiles...');
    const organizationProfiles = await OrganizationProfile.find({});
    let organizationUpdates = 0;
    
    for (const profile of organizationProfiles) {
      const oldState = profile.state;
      const newState = cleanStateName(oldState);
      
      if (oldState !== newState) {
        await OrganizationProfile.updateOne(
          { _id: profile._id },
          { $set: { state: newState } }
        );
        console.log(`Organization ${profile._id}: "${oldState}" -> "${newState}"`);
        organizationUpdates++;
      }
    }
    
    console.log(`\nCleanup completed!`);
    console.log(`Volunteer profiles updated: ${volunteerUpdates}`);
    console.log(`Organization profiles updated: ${organizationUpdates}`);
    
  } catch (error) {
    console.error('Error during cleanup:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the cleanup
cleanupStates(); 