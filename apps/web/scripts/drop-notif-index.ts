import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function dropIndex() {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        console.error('MONGODB_URI not found');
        process.exit(1);
    }

    try {
        await mongoose.connect(uri);
        console.log('✅ Connected to MongoDB');

        // The collection name is likely 'notifications'
        const collection = mongoose.connection.collection('notifications');

        // List indexes to be sure
        const indexes = await collection.indexes();
        console.log('Current indexes:', JSON.stringify(indexes, null, 2));

        const indexName = 'user_1_opportunity_id_1_type_1';

        if (indexes.some(idx => idx.name === indexName)) {
            console.log(`Dropping index: ${indexName}...`);
            await collection.dropIndex(indexName);
            console.log('✅ Index dropped successfully');
        } else {
            console.log('ℹ️ Index not found, it might have a different name or is already gone.');
        }

    } catch (error) {
        console.error('❌ Error dropping index:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

dropIndex();
