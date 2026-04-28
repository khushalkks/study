import os
from motor.motor_asyncio import AsyncIOMotorClient

MONGODB_URL   = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME = "cortexcraft"

client = None
db     = None

async def connect_to_mongo():
    global client, db
    client = AsyncIOMotorClient(MONGODB_URL)
    db     = client[DATABASE_NAME]
    print(f"[DB] Connected to MongoDB: {DATABASE_NAME}")

async def close_mongo_connection():
    global client
    if client:
        client.close()
        print("[DB] Closed MongoDB connection")

def get_database():
    return db
