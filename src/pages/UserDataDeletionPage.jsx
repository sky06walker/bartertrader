import React from 'react';
import { Link } from 'react-router-dom';
import './CompliancePages.css';

export default function UserDataDeletionPage() {
  return (
    <div className="compliance-page">
      <div className="compliance-container glass-card">
        <div className="compliance-header">
          <h1>User Data Deletion Instructions</h1>
          <p className="last-updated">Last Updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="compliance-content">
          <section>
            <p>
              <strong>BarterTrader</strong> provides a way for users to delete their accounts and all associated data directly from the application. 
              Additionally, if you logged in using Facebook, you can remove the app connection from your Facebook settings to revoke our access 
              to your profile information.
            </p>
          </section>

          <section>
            <h2>Option 1: Complete Account Deletion (Recommended)</h2>
            <p>
              To completely remove your account and all associated marketplace items and personal data from our systems:
            </p>
            <ol>
              <li>Log into the BarterTrader application using your existing credentials.</li>
              <li>Navigate to your Profile/Settings page (this feature is accessible when logged in).</li>
              <li>Locate the <strong>&quot;Delete Account&quot;</strong> section.</li>
              <li>Click the button to permanently delete your account and confirm the action.</li>
              <li>Upon confirmation, all your personal data including name, email, items, and trade history will be permanently erased from our database.</li>
            </ol>
          </section>

          <section>
            <h2>Option 2: Removing Facebook Integration</h2>
            <p>
              If you registered using Facebook and simply want to revoke BarterTrader&apos;s permission to access your Facebook profile data 
              (without deleting your marketplace items), follow these steps provided by Facebook:
            </p>
            <ol>
              <li>Log into your Facebook account on the web or mobile app.</li>
              <li>Go to <strong>Settings &amp; Privacy</strong> &gt; <strong>Settings</strong>.</li>
              <li>Navigate to <strong>Apps and Websites</strong> from the left-hand menu.</li>
              <li>Find <strong>BarterTrader</strong> in the list of active apps and click <strong>Remove</strong>.</li>
              <li>Confirm your choice by clicking the <strong>Remove</strong> button.</li>
            </ol>
            <p className="note">
              <em>Note: Removing the app from Facebook revokes future access but does not automatically delete your data from our database. 
              To perform a complete data deletion, please follow Option 1 above.</em>
            </p>
          </section>

          <section>
            <h2>Contact Us for Manual Deletion</h2>
            <p>
              If you are unable to log into your account to perform the deletion yourself, please contact our support team. 
              We will verify your identity and manually process your data deletion request within 30 days.
            </p>
          </section>
        </div>

        <div className="compliance-footer">
          <Link to="/" className="btn btn-ghost">← Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
