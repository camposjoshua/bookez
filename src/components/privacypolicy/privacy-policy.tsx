/* eslint-disable @typescript-eslint/no-unused-vars */
import './privacy-policy.css';
import { Document, Page } from 'react-pdf';
import { useEffect, useState } from 'react';

function PrivacyPolicyPage() {
  const privacyPolicyText = `
1. This is to inform you that all personal information collected from you as a user of the Silver Lining Hopeline App, such as full name, email address, phone numbers, signature, picture, date of birth, age, nationality, and other sensitive information shall be used as part of your access to Silver Lining Hopeline App. Any personal information received from third parties will likewise be used for the same purpose.
2. In the event that you provide us with personal information relating to a third party or your family member, you acknowledge that you have his/her consent for us to use the information for purposes in which they were collected.
3. We hereby inform you that we have in place administrative, technical, personal and physical measures to protect and safeguard your information against loss, misuse, unauthorized access, theft, unauthorized modification, disclosure or destruction. We have restricted access to your personal information to those employees and contractor employees who have a legitimate business need for such access.
4. Silver Lining Hopeline App also provides training to employees and third parties where relevant to promote awareness of Silver Lining Hopeline App’s requirements and policies surrounding protection and security of your personal information.
5. By giving us your personal information, it is understood that you consent to the transfer of such information where applicable, to any entity that forms a direct or indirect part of Silver Lining Hopeline.
6. Similarly, your personal information may also be processed and shared with third parties or affiliates for various purposes.
  A. Operations Management: including but not limited to establishment, performance and management of business activities of Silver Lining Hopeline.
  B. Security Management: including but not limited to ensuring the security of Silver Lining Hopeline’s premises and information held by Silver Lining Hopeline as well as the safety of Silver Lining Hopeline Employees.
  C. Legal and Regulatory Compliance: including but not limited to obtaining and releasing Employee Personal Information as required by law or judicial authorization.
  D. Conducting analytics and research such as employee behaviors, preferences, associate lifecycle, market data and similar activities.
7. However, Silver Lining Hopeline App may still disclose your personal information to third parties only if required by law or legal order, or to protect the interest of Silver Lining Hopeline and/or its employees, or if there is an emergency situation involving the health and safety of an employee, or when necessary for Silver Lining Hopeline to perform a contractual obligation owed to an employee or for other lawful purposes, such as to establish a claim or defense, or with your consent.
8. You may be entitled to object to the sharing of your information except when the disclosure is required by law, regulations, court order, or where the transfer is necessary to perform an obligation owed to you, as a result of your employment with Silver Lining Hopeline App. You may also withdraw your consent for the use of your personal information at any time during your employment with Silver Lining Hopeline App. However, please note that, upon withdrawal of your consent, we will be unable to process your personal information to provide you with any service that would require the processing of your information.
9. Silver Lining Hopeline App will employ reasonable means to keep your personal information accurate, complete, up-to-date and reliable. However, it is your responsibility to inform us regarding changes that may occur in your personal information. You will be permitted to review and, where inaccurate, correct your personal information. However, we reserve the right to deny access to or make changes in your personal information, when doing so is disproportionate to the risk and expense required to update or correct your personal information.
10. Silver Lining Hopeline App may also disclose your personal information to any affiliates where such entities need to process your personal information for business or business efficiency purposes. Silver Lining Hopeline will ensure that your personal information is protected during such disclosure or transfer. Your personal information may also be processed outside the Philippines through the present platform but only to the extent of storage and none other.
11. Silver Lining Hopeline will maintain a program to ensure compliance with this Privacy Notice. The Data Privacy Team is primarily responsible for implementing and overseeing the administration of this Privacy Notice. All employees whose responsibilities include processing of Associate Personal Information are required to adhere to this Privacy Notice and any implementing policies. Failure to do so is deemed a serious offense, for which disciplinary action may be taken, potentially resulting in termination of employment. Equally, the misuse of Associate Personal Information by an individual or organization acting as agent or service provider to Silver Lining Hopeline is deemed a serious issue for which action may be taken, potentially resulting in the termination of any agreement.
12. Finally, consistent with the Data Privacy Act of 2012, its Implementing Rules and Regulations, advisory opinions of the National Privacy Commission and existing jurisprudence, you have the following rights:
  A. You have the right to be informed, whether personal data pertaining to you shall be, are being, or have been processed, including the existence of automated decision-making and profiling. You shall be notified and furnished with information before the entry of your personal data into the processing system of the personal information controller, or at the next practical opportunity.
  B. You shall have the right to object to the processing of your personal data, including processing for direct marketing, automated processing or profiling. You shall also be notified and given an opportunity to withhold consent to the processing in case of changes or any amendment to the information supplied or declared to you in the preceding paragraph.
  C. That you have the right to reasonable access to, upon demand, the following:
    (a) Contents of your personal data that were processed;
    (b) Sources from which personal data were obtained;
    (c) Names and addresses of recipients of the personal data;
    (d) Manner by which such data were processed;
    (e) Reasons for the disclosure of the personal data to recipients, if any;
    (f) Information on automated processes where the data will, or is likely to, be made as the sole basis for any decision that significantly affects or will affect you;
    (g) Date when your personal data were last accessed and modified; and
    (h) The designation, name or identity, and address of the personal information controller.
  D. You have the right to dispute the inaccuracy or error in the personal data and have the personal information controller correct it immediately and accordingly, unless the request is unjustified or otherwise unreasonable. If the personal data has been corrected, the personal information controller shall ensure the accessibility of both the new and the retracted information and the simultaneous receipt of the new and the retracted information by the intended recipients thereof: Provided, That recipients or third parties who have previously received such processed personal data shall be informed of its inaccuracy and its rectification, upon your reasonable request.
  E. You shall have the right to suspend, withdraw or order the blocking, removal or destruction of your personal data from the personal information controller’s filing system. This right may be exercised upon discovery and substantial proof of any of the following:
    (a) Your personal data is incomplete, outdated, false, or unlawfully obtained;
    (b) Your personal data is being used for purpose that you do not authorize;
    (c) Your personal data is no longer necessary for the purposes for which they were collected;
    (d) You withdraw consent or object to the processing, and there is no other legal ground or overriding legitimate interest for the processing;
    (e) The personal data concerns private information that is prejudicial to you, unless justified by freedom of speech, of expression, or of the press or otherwise authorized;
    (f) The processing is unlawful;
    (g) The personal information controller or personal information processor violated your rights.
  F. You shall be indemnified for any damages sustained due to such inaccurate, incomplete, outdated, false, unlawfully obtained or unauthorized use of personal data, taking into account any violation of your rights and freedom.
13. Should you not consent to the collection, processing, storage and disposal of your personal information as required in this notice, Silver Lining Hopeline may be constrained not to disallow access to the platform.`;

  function renderPrivacyPolicy(text: any) {
    // Split the text into paragraphs based on new lines
    const paragraphs = text.split(/\n\s*\n/);

    // Render each paragraph
    const renderedParagraphs = paragraphs.map((paragraph: any, index: any) => {
      // Split each paragraph into lines
      const lines = paragraph.split('\n');

      // Render each line with appropriate numbering or lettering
      const renderedLines = lines.map((line: any, lineIndex: any) => {
        // Check if the line starts with a number, capital letter, or lowercase letter followed by a dot
        if (/^\d+\./.test(line)) {
          // Render the line with a dot and space and add class for numbering
          return (
            <li key={lineIndex} className="numbering">
              {line}
            </li>
          );
        } else if (/^\s*[A-Z]\./.test(line)) {
          // Render the line with a dot and space and add class for big letters
          return (
            <li key={lineIndex} className="big-letter">
              {line}
            </li>
          );
        } else if (/^\s*[a-z]\./.test(line)) {
          // Render the line with a dot and space and add class for small letters
          return (
            <li key={lineIndex} className="small-letter">
              {line}
            </li>
          );
        } else {
          // Render the line as is
          return (
            <li className="small-letter" key={lineIndex}>
              {line}
            </li>
          );
        }
      });

      // Render the lines as a list
      return <ul key={index}>{renderedLines}</ul>;
    });

    // Return the rendered paragraphs
    return renderedParagraphs;
  }
  useEffect(() => {
    // console.log('rerender')
  }, []);

  return (
    <div
      style={{
        backgroundColor: 'white',
        padding: '5%',
        margin: '5%',
        borderRadius: 20,
      }}
    >
      <div style={{ display: 'flex', padding: '5%' }}>
        <h2>Data Privacy Notice for Silver Lining Hopeline Platform Users</h2>
      </div>
      <div className="privacy-policy">
        {renderPrivacyPolicy(privacyPolicyText)}
      </div>
    </div>
  );
}
export default PrivacyPolicyPage;
