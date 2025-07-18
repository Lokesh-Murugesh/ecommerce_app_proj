# File: tests/test_orders_db.py

import os
import pytest
import firebase_admin
from firebase_admin import credentials, firestore
import time # For generating unique timestamps

# --- Firebase Initialization (using service account JSON file) ---
SERVICE_ACCOUNT_KEY_PATH = "small-shop-ecommerce-firebase-adminsdk-fbsvc-8bfc5fa09e.json"

try:
    if not firebase_admin._apps:
        cred = credentials.Certificate(SERVICE_ACCOUNT_KEY_PATH)
        firebase_admin.initialize_app(cred)
        print("Firebase Admin SDK initialized successfully using JSON file.")
    else:
        print("Firebase Admin SDK already initialized.")
except Exception as e:
    print(f"Error initializing Firebase Admin SDK: {e}")
    print(f"Please ensure the service account key file '{SERVICE_ACCOUNT_KEY_PATH}' exists and is valid.")
    pytest.fail(f"Firebase Admin SDK initialization failed: {e}")


db = firestore.client()
orders_collection = db.collection("orders")

# --- Dummy Data Structure for TOrder (matching your TypeScript definition) ---
def get_dummy_order(uid: str, payment_id: str, status: str = "active", order_tracking_code: str = ""):
    return {
        "items": [
            {
                "itemId": "prod123",
                "itemName": "Test Product",
                "itemPrice": 100.0,
                "quantity": 1,
                "categorySlug": "electronics",
                "productSlug": "test-product",
                "size": "M"
            }
        ],
        "uid": uid,
        "paymentId": payment_id,
        "paymentStatus": "success",
        "status": status,
        "orderTrackingCode": order_tracking_code,
        "deliveryDetails": {
            "address": "123 Test St",
            "city": "Testville",
            "postalCode": "12345",
            "state": "TS",
            "name": "John Doe",
            "phone": "555-123-4567",
            "email": "john.doe@example.com",
        },
        "createTimestamp": int(time.time() * 1000), # Milliseconds timestamp
        "deliveryFee": 5.0,
    }

# --- Pytest Fixtures ---

@pytest.fixture(scope="module")
def setup_teardown_firebase():
    """Fixture to ensure Firebase is initialized once per module."""
    # Firebase initialization is done globally at the top of the file
    yield
    # No specific teardown needed for the Firebase app itself,
    # as it's typically initialized once per process.

@pytest.fixture
def clean_orders_collection(setup_teardown_firebase):
    """
    Fixture to create and clean up a test order for each test function.
    It returns the ID of the newly created test order.
    """
    test_uid = f"test_user_{int(time.time())}"
    test_payment_id = f"test_payment_{int(time.time())}"
    dummy_order = get_dummy_order(test_uid, test_payment_id)

    # Add a test order
    doc_ref = orders_collection.add(dummy_order)
    order_id = doc_ref[1].id
    print(f"\nCreated test order with ID: {order_id}")

    yield order_id # Provide the order_id to the test function

    # Teardown: Delete the test order after the test runs
    orders_collection.document(order_id).delete()
    print(f"Deleted test order with ID: {order_id}")

# --- Pytest Test Functions ---

def test_create_order(setup_teardown_firebase):
    """Test creating a new order."""
    test_uid = f"new_test_user_{int(time.time())}"
    test_payment_id = f"new_test_payment_{int(time.time())}"
    new_order_data = get_dummy_order(test_uid, test_payment_id, status="active")

    doc_ref = orders_collection.add(new_order_data)
    new_order_id = doc_ref[1].id
    assert new_order_id is not None

    # Verify the order exists
    doc_snap = orders_collection.document(new_order_id).get()
    assert doc_snap.exists
    retrieved_data = doc_snap.to_dict()
    assert retrieved_data["uid"] == new_order_data["uid"]
    assert retrieved_data["paymentId"] == new_order_data["paymentId"]

    # Clean up immediately
    orders_collection.document(new_order_id).delete()


def test_get_order(clean_orders_collection):
    """Test retrieving a specific order by ID."""
    order_id = clean_orders_collection
    doc_snap = orders_collection.document(order_id).get()
    assert doc_snap.exists
    retrieved_order = doc_snap.to_dict()
    assert retrieved_order["status"] == "active" # Default status from fixture


def test_update_order_tracking(clean_orders_collection):
    """Test updating the order tracking code."""
    order_id = clean_orders_collection
    new_tracking_code = "TRACK123XYZ"
    orders_collection.document(order_id).update({"orderTrackingCode": new_tracking_code})

    doc_snap = orders_collection.document(order_id).get()
    retrieved_order = doc_snap.to_dict()
    assert retrieved_order["orderTrackingCode"] == new_tracking_code


def test_complete_order(clean_orders_collection):
    """Test marking an order as 'delivered'."""
    order_id = clean_orders_collection
    orders_collection.document(order_id).update({"status": "delivered"})

    doc_snap = orders_collection.document(order_id).get()
    retrieved_order = doc_snap.to_dict()
    assert retrieved_order["status"] == "delivered"


def test_cancel_order(clean_orders_collection):
    """Test marking an order as 'cancelled'."""
    order_id = clean_orders_collection
    orders_collection.document(order_id).update({"status": "cancelled"})

    doc_snap = orders_collection.document(order_id).get()
    retrieved_order = doc_snap.to_dict()
    assert retrieved_order["status"] == "cancelled"

def test_get_user_orders(setup_teardown_firebase):
    """Test retrieving orders for a specific user."""
    # Create two orders for the same user, and one for a different user
    user_id_1 = f"user_{int(time.time())}_A"
    user_id_2 = f"user_{int(time.time())}_B"

    order_1_id = orders_collection.add(get_dummy_order(user_id_1, "payment_A1"))[1].id
    order_2_id = orders_collection.add(get_dummy_order(user_id_1, "payment_A2"))[1].id
    order_3_id = orders_collection.add(get_dummy_order(user_id_2, "payment_B1"))[1].id

    # Allow time for Firestore writes to propagate
    time.sleep(1)

    # Query for orders of user_id_1
    docs = orders_collection.where("uid", "==", user_id_1).get()
    user_orders_ids = [doc.id for doc in docs]

    assert len(user_orders_ids) == 2
    assert order_1_id in user_orders_ids
    assert order_2_id in user_orders_ids
    assert order_3_id not in user_orders_ids

    # Clean up created orders
    orders_collection.document(order_1_id).delete()
    orders_collection.document(order_2_id).delete()
    orders_collection.document(order_3_id).delete()
