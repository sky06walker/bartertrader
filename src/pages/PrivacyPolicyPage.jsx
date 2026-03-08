import React from 'react';
import { Link } from 'react-router-dom';
import './CompliancePages.css';

export default function PrivacyPolicyPage() {
  return (
    <div className="compliance-page">
      <div className="compliance-container glass-card">
        <div className="compliance-header">
          <h1>Privacy Policy</h1>
          <p className="last-updated">Last Updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="compliance-content">
          <section>
            <h2>1. Introduction</h2>
            <p>
              Welcome to <strong>BarterTrader</strong>. We respect your privacy and are committed to protecting your personal data. 
              This privacy policy will inform you as to how we look after your personal data when you visit our website and tell you 
              about your privacy rights and how the law protects you.
            </p>
          </section>

          <section>
            <h2>2. The Data We Collect About You</h2>
            <p>
              When you use our application, particularly when logging in via third-party providers like Google or Facebook, 
              we may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:
            </p>
            <ul>
              <li><strong>Identity Data:</strong> includes your first name, last name, and profile picture.</li>
              <li><strong>Contact Data:</strong> includes your email address.</li>
              <li><strong>Technical Data:</strong> includes internet protocol (IP) address, your login data, browser type and version.</li>
            </ul>
          </section>

          <section>
            <h2>3. How We Use Your Personal Data</h2>
            <p>We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:</p>
            <ul>
              <li>To register you as a new user and manage your account.</li>
              <li>To facilitate item trading between users.</li>
              <li>To manage our relationship with you.</li>
              <li>To improve our website, products/services, marketing, customer relationships, and experiences.</li>
            </ul>
          </section>

          <section>
            <h2>4. Data Sharing and Security</h2>
            <p>
              We do not sell, trade, or otherwise transfer your personally identifiable information to outside parties 
              except as necessary to provide our services. We have put in place appropriate security measures to prevent 
              your personal data from being accidentally lost, used, or accessed in an unauthorized way, altered, or disclosed.
            </p>
          </section>

          <section>
            <h2>5. Your Legal Rights</h2>
            <p>
              Under certain circumstances, you have rights under data protection laws in relation to your personal data, 
              including the right to request access, correction, erasure (deletion), restriction, transfer, to object to processing, 
              to portability of data, and (where the lawful ground of processing is consent) to withdraw consent.
            </p>
            <p>
              If you wish to delete your data associated with third-party logins (like Facebook), please see our <Link to="/data-deletion">Data Deletion Instructions</Link>.
            </p>
          </section>

          <section>
            <h2>6. Contact Us</h2>
            <p>
              If you have any questions about this privacy policy or our privacy practices, please contact us via our support channels.
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
