# Firestore Security Rules Setup

Your profile creation is failing because Firestore security rules are blocking write access. Follow these steps to fix it:

## Step 1: Open Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: **umoney-13244**
3. Click on **Firestore Database** in the left menu

## Step 2: Update Security Rules

1. Click on the **Rules** tab at the top
2. Replace the existing rules with the following:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to check if user is admin
    function isAdmin() {
      return request.auth != null && request.auth.token.email == 'admin@gmail.com';
    }
    
    // System settings - read by all, write by admin only
    match /system/{document=**} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // Users collection - users can read/write their own profile, admin can update all
    match /users/{userId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.auth.uid == userId;
      allow update: if request.auth != null && (request.auth.uid == userId || isAdmin());
      allow delete: if false;
    }
    
    // Transactions - users can read/create their own, admin can read and update all
    match /transactions/{transactionId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if isAdmin();
      allow delete: if false;
    }
  }
}
```

## Step 3: Publish the Rules

1. Click the **Publish** button at the top right
2. Wait for the confirmation message

## Step 4: Test Profile Creation

1. Go back to your app (http://localhost:5174)
2. Refresh the page
3. Click **"Create Profile Now"** again
4. It should now work successfully!

## Alternative: Test Mode (Temporary)

If you just want to test quickly (NOT recommended for production):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

This allows any authenticated user to read/write any document. **Use the proper rules above for production!**

## Troubleshooting

If it still doesn't work:
1. Make sure you're logged in to the app
2. Check browser console (F12) for detailed error messages
3. Verify the rules were published successfully
4. Try logging out and back in
