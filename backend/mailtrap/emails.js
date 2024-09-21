import { mailtrapClient, sender } from '../mailtrap/mailtrap.config.js';
import {
  PASSWORD_RESET_REQUEST,
  PASSWORD_RESET_SUCCESS,
  VERIFY_EMAIL,
} from './emailTemplates.js';

export const sendVerificationEmail = async (email, verifyCode) => {
  const recipient = [{ email }];

  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: 'Verify your email',
      html: VERIFY_EMAIL.replace('{verificationCode}', verifyCode),
      category: 'Email Verification',
    });

    console.log('Verification email sent successfully', response);
  } catch (error) {
    throw new Error(`Error sending verification email: ${error}`);
  }
};

export const sendWelcomeEmail = async (email, name) => {
  const recipient = [{ email }];

  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      template_uuid: 'a95ca31b-bea1-4c39-8ade-ea7150b4e32d',
      template_variables: { company_info_name: 'Auth Company', name: name },
    });

    console.log('Welcome email sent successfully', response);
  } catch (error) {
    throw new Error(`Error sending welcome email: ${error}`);
  }
};

export const sendPasswordResetEmail = async (email, resetURL) => {
  const recipient = [{ email }];

  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: 'Reset your password',
      html: PASSWORD_RESET_REQUEST.replace('{resetURL}', resetURL),
      category: 'Password Reset',
    });

    console.log('Password reset email sent successfully', response);
  } catch (error) {
    throw new Error(`Error sending password reset email, ${error}`);
  }
};

export const sendResetSuccessEmail = async (email) => {
  const recipient = [{ email }];

  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: 'Password Reset Successful',
      html: PASSWORD_RESET_SUCCESS,
      category: 'Password Reset',
    });

    console.log('Password reset success email sent successfully', response);
  } catch (error) {
    throw new Error(`Error sending password reset success email, ${error}`);
  }
};
