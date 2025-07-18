import firebase_admin
from firebase_admin import credentials, auth

cred = credentials.Certificate("sa.json")
firebase_admin.initialize_app(cred)

def add_admin_role(uid):
    try:
        user = auth.get_user(uid)
        current_claims = user.custom_claims or {}

        current_claims['admin'] = True

        auth.set_custom_user_claims(uid, current_claims)

        print(f"Admin role added successfully for user with UID: {uid}")
    except Exception as e:
        print(f"Error adding admin role: {str(e)}")

if __name__ == "__main__":
    user = auth.get_user_by_email("user@example.com")

    user_uid = user.uid
    add_admin_role(user_uid)