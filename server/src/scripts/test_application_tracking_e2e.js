import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

import User from '../models/User.js';
import Opportunity from '../models/Opportunity.js';
import Application from '../models/Application.js';
import Notification from '../models/Notification.js';
import OrganizationInterview from '../models/OrganizationInterview.js';

const API_BASE = 'http://localhost:5000/api';
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_jwt_secret_dishasetu_2026';

function generateToken(userId, role = 'user') {
  return jwt.sign({ id: userId, role }, JWT_SECRET, { expiresIn: '1d' });
}

async function request(url, options = {}) {
  const fullUrl = url.startsWith('http') ? url : `${API_BASE}${url}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    ...(options.headers || {})
  };

  const fetchOptions = {
    method: options.method || 'GET',
    headers,
    ...(options.body ? { body: JSON.stringify(options.body) } : {})
  };

  const res = await fetch(fullUrl, fetchOptions);
  const data = await res.json().catch(() => null);
  return { status: res.status, ok: res.ok, data };
}

async function runTest() {
  console.log('====================================================');
  console.log('CANDIDATE APPLICATION TRACKING & NOTIFICATIONS TEST');
  console.log('====================================================');

  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/dishasetu';
  await mongoose.connect(mongoUri);
  console.log('✓ Connected to MongoDB');

  // 1. Setup Candidate 1, Candidate 2, Org 1, Org 2
  let candidate1 = await User.findOne({ email: 'test_candidate_track1@dishasetu.ai' });
  if (!candidate1) {
    candidate1 = await User.create({
      name: 'Priya Sharma',
      email: 'test_candidate_track1@dishasetu.ai',
      password: 'Password123',
      role: 'user',
      isOnboarded: true
    });
  }

  let candidate2 = await User.findOne({ email: 'test_candidate_track2@dishasetu.ai' });
  if (!candidate2) {
    candidate2 = await User.create({
      name: 'Rahul Verma',
      email: 'test_candidate_track2@dishasetu.ai',
      password: 'Password123',
      role: 'user',
      isOnboarded: true
    });
  }

  let org1 = await User.findOne({ email: 'test_org_track1@dishasetu.ai' });
  if (!org1) {
    org1 = await User.create({
      name: 'Infosys Careers',
      email: 'test_org_track1@dishasetu.ai',
      password: 'Password123',
      role: 'organization',
      organizationDetails: { name: 'Infosys Limited' }
    });
  }

  let org2 = await User.findOne({ email: 'test_org_track2@dishasetu.ai' });
  if (!org2) {
    org2 = await User.create({
      name: 'TCS Innovation',
      email: 'test_org_track2@dishasetu.ai',
      password: 'Password123',
      role: 'organization',
      organizationDetails: { name: 'Tata Consultancy Services' }
    });
  }

  const tokenCand1 = generateToken(candidate1._id, 'user');
  const tokenCand2 = generateToken(candidate2._id, 'user');
  const tokenOrg1 = generateToken(org1._id, 'organization');
  const tokenOrg2 = generateToken(org2._id, 'organization');

  // Create a published opportunity for Org 1
  let opp1 = await Opportunity.findOne({ title: 'Junior Full Stack Engineer - Track Test' });
  if (!opp1) {
    opp1 = await Opportunity.create({
      title: 'Junior Full Stack Engineer - Track Test',
      organization: 'Infosys Limited',
      organizationId: org1._id,
      type: 'Job',
      category: 'Technology',
      description: 'Full stack development role using React, Node.js and MongoDB',
      location: 'Bhopal / Hybrid',
      workMode: 'Hybrid',
      stipendOrSalary: '₹4.5 - ₹6.0 LPA',
      skills: ['React', 'Node.js', 'MongoDB', 'JavaScript'],
      applicationUrl: 'https://careers.infosys.com',
      status: 'published'
    });
  }

  // Create a published opportunity for Org 2
  let opp2 = await Opportunity.findOne({ title: 'Cloud Infrastructure Associate - Track Test' });
  if (!opp2) {
    opp2 = await Opportunity.create({
      title: 'Cloud Infrastructure Associate - Track Test',
      organization: 'TCS Innovation',
      organizationId: org2._id,
      type: 'Internship',
      category: 'Technology',
      description: 'Cloud support and DevOps automation',
      location: 'Indore',
      workMode: 'On-site',
      stipendOrSalary: '₹25,000 / month',
      skills: ['AWS', 'Linux', 'Docker'],
      applicationUrl: 'https://careers.tcs.com',
      status: 'published'
    });
  }

  // Clean previous test applications and notifications for clean test run
  await Application.deleteMany({ candidate: { $in: [candidate1._id, candidate2._id] } });
  await Notification.deleteMany({ recipient: { $in: [candidate1._id, candidate2._id] } });
  await OrganizationInterview.deleteMany({ candidate: { $in: [candidate1._id, candidate2._id] } });

  console.log('✓ 1. Test Users and Opportunities created & environment prepared.');

  // 2. Candidate 1 applies to Opportunity 1
  const applyRes = await request(`/applications/${opp1._id}`, {
    method: 'POST',
    token: tokenCand1
  });

  if (!applyRes.ok || !applyRes.data.success) {
    throw new Error(`Candidate apply failed: ${JSON.stringify(applyRes.data)}`);
  }
  const appId1 = applyRes.data.data._id;
  console.log(`✓ 2. Candidate 1 successfully applied to ${opp1.title} (App ID: ${appId1})`);

  // 3. Verify duplicate application prevention
  const dupApplyRes = await request(`/applications/${opp1._id}`, {
    method: 'POST',
    token: tokenCand1
  });
  if (dupApplyRes.status === 400 && dupApplyRes.data.message.includes('already applied')) {
    console.log('✓ 3. Duplicate application correctly prevented with HTTP 400.');
  } else {
    throw new Error(`Duplicate apply not blocked: ${JSON.stringify(dupApplyRes.data)}`);
  }

  // 4. Candidate checks /api/applications/my
  const myAppsRes = await request('/applications/my', { token: tokenCand1 });
  if (!myAppsRes.ok || myAppsRes.data.count !== 1) {
    throw new Error(`My applications returned unexpected count: ${JSON.stringify(myAppsRes.data)}`);
  }
  const appItem = myAppsRes.data.data[0];
  if (appItem.status !== 'applied') {
    throw new Error(`Unexpected status in my applications: ${appItem.status}`);
  }
  if (!myAppsRes.data.summary || myAppsRes.data.summary.total !== 1) {
    throw new Error(`Summary statistics missing or invalid: ${JSON.stringify(myAppsRes.data.summary)}`);
  }
  console.log('✓ 4. /api/applications/my returns candidate record and accurate summary:', myAppsRes.data.summary);

  // 5. Verify Candidate 1 received "Application Submitted" notification
  const notifs1 = await request('/notifications', { token: tokenCand1 });
  if (!notifs1.ok || notifs1.data.count < 1) {
    throw new Error(`Notification not received for submission: ${JSON.stringify(notifs1.data)}`);
  }
  const submitNotif = notifs1.data.data.find(n => n.type === 'application_submitted');
  if (!submitNotif || !submitNotif.message.includes('Your application has been submitted to Infosys Limited')) {
    throw new Error(`Unexpected submission notification content: ${JSON.stringify(submitNotif)}`);
  }
  console.log(`✓ 5. Candidate received "Application Submitted" notification: "${submitNotif.message}"`);

  // 6. Organization 1 updates status to 'under_review'
  const underReviewRes = await request(`/organization/applications/${appId1}/status`, {
    method: 'PATCH',
    token: tokenOrg1,
    body: { status: 'under_review' }
  });
  if (!underReviewRes.ok || underReviewRes.data.data.status !== 'under_review') {
    throw new Error(`Org status update to under_review failed: ${JSON.stringify(underReviewRes.data)}`);
  }
  console.log('✓ 6. Organization 1 updated status to "under_review".');

  // Verify candidate sees updated status and received notification
  const notifs2 = await request('/notifications', { token: tokenCand1 });
  const reviewNotif = notifs2.data.data.find(n => n.type === 'application_under_review');
  if (!reviewNotif || !reviewNotif.message.includes('Infosys Limited is reviewing your application')) {
    throw new Error(`Review notification missing or incorrect: ${JSON.stringify(notifs2.data)}`);
  }
  console.log(`✓ 7. Candidate received "Under Review" notification: "${reviewNotif.message}"`);

  // 8. Organization 1 updates status to 'shortlisted'
  const shortlistRes = await request(`/organization/applications/${appId1}/status`, {
    method: 'PATCH',
    token: tokenOrg1,
    body: { status: 'shortlisted' }
  });
  if (!shortlistRes.ok || shortlistRes.data.data.status !== 'shortlisted') {
    throw new Error(`Org status update to shortlisted failed: ${JSON.stringify(shortlistRes.data)}`);
  }
  console.log('✓ 8. Organization 1 updated status to "shortlisted".');

  // Verify candidate receives shortlisted notification
  const notifs3 = await request('/notifications', { token: tokenCand1 });
  const shortlistNotif = notifs3.data.data.find(n => n.type === 'application_shortlisted');
  if (!shortlistNotif || !shortlistNotif.message.includes('You have been shortlisted')) {
    throw new Error(`Shortlist notification missing: ${JSON.stringify(notifs3.data)}`);
  }
  console.log(`✓ 9. Candidate received "Shortlisted" notification: "${shortlistNotif.message}"`);

  // 10. Organization 1 schedules an interview
  const scheduleRes = await request('/organization/interviews', {
    method: 'POST',
    token: tokenOrg1,
    body: {
      applicationId: appId1,
      title: 'Technical Round 1 - React & Node.js',
      type: 'technical',
      scheduledDate: new Date(Date.now() + 86400000).toISOString(),
      startTime: '10:00 AM',
      endTime: '11:00 AM',
      mode: 'online',
      meetingLink: 'https://meet.google.com/abc-defg-hij',
      instructions: 'Please be prepared to code a React component.'
    }
  });
  if (!scheduleRes.ok || !scheduleRes.data.success) {
    throw new Error(`Interview scheduling failed: ${JSON.stringify(scheduleRes.data)}`);
  }
  console.log('✓ 10. Organization 1 scheduled an interview.');

  // Check application status moved to 'interview' and candidate received notification
  const appDetailRes = await request(`/applications/detail/${appId1}`, { token: tokenCand1 });
  if (!appDetailRes.ok || appDetailRes.data.data.application.status !== 'interview') {
    throw new Error(`Application status should be 'interview', got: ${appDetailRes.data?.data?.application?.status}`);
  }
  if (!appDetailRes.data.data.interview) {
    throw new Error('Interview details missing from candidate application detail');
  }
  const notifs4 = await request('/notifications', { token: tokenCand1 });
  const interviewNotif = notifs4.data.data.find(n => n.type === 'interview_update');
  if (!interviewNotif) {
    throw new Error(`Interview notification missing: ${JSON.stringify(notifs4.data)}`);
  }
  console.log(`✓ 12. Candidate received "Interview Update" notification: "${interviewNotif.message}"`);

  // 12b. Complete interview and update status to 'selected'
  const feedbackRes = await request(`/organization/interviews/${scheduleRes.data.data._id}/feedback`, {
    method: 'PATCH',
    token: tokenOrg1,
    body: { feedback: { overallNotes: 'Exceptional candidate, strong algorithmic and React skills.' } }
  });
  if (!feedbackRes.ok || !feedbackRes.data.success) {
    throw new Error(`Interview feedback submission failed: ${JSON.stringify(feedbackRes.data)}`);
  }

  const selectRes = await request(`/organization/applications/${appId1}/status`, {
    method: 'PATCH',
    token: tokenOrg1,
    body: { status: 'selected' }
  });
  if (!selectRes.ok || selectRes.data.data.status !== 'selected') {
    throw new Error(`Org status update to selected failed: ${JSON.stringify(selectRes.data)}`);
  }
  console.log('✓ 12b. Organization 1 selected candidate after completed interview.');

  const notifsSelected = await request('/notifications', { token: tokenCand1 });
  const selectNotif = notifsSelected.data.data.find(n => n.type === 'application_selected');
  if (!selectNotif || !selectNotif.message.includes('has been selected')) {
    throw new Error(`Selection notification missing: ${JSON.stringify(notifsSelected.data)}`);
  }
  console.log(`✓ 12c. Candidate received "Selected" notification: "${selectNotif.message}"`);

  // 13. Mark single notification as read & test unreadCount
  const unreadBefore = notifsSelected.data.unreadCount;
  const markReadRes = await request(`/notifications/${interviewNotif._id}/read`, {
    method: 'PATCH',
    token: tokenCand1
  });
  if (!markReadRes.ok || markReadRes.data.unreadCount !== unreadBefore - 1) {
    throw new Error(`Unread count did not decrement correctly: ${JSON.stringify(markReadRes.data)}`);
  }
  console.log('✓ 13. Single notification marked as read; unread count decremented.');

  // 14. Mark all notifications as read
  const markAllRes = await request('/notifications/mark-all-read', {
    method: 'PATCH',
    token: tokenCand1
  });
  if (!markAllRes.ok || markAllRes.data.unreadCount !== 0) {
    throw new Error(`Mark all read failed: ${JSON.stringify(markAllRes.data)}`);
  }
  console.log('✓ 14. Mark all as read succeeded; unreadCount is 0.');

  // 15. Authorization Isolation Tests:
  // Candidate 2 attempts to view Candidate 1's application detail -> 404
  const crossCandRes = await request(`/applications/detail/${appId1}`, { token: tokenCand2 });
  if (crossCandRes.status === 404) {
    console.log('✓ 15. Cross-candidate isolation enforced (Candidate 2 cannot access Candidate 1 application).');
  } else {
    throw new Error(`Cross-candidate isolation failed, status: ${crossCandRes.status}`);
  }

  // Organization 2 attempts to modify Organization 1's application status -> 404
  const crossOrgRes = await request(`/organization/applications/${appId1}/status`, {
    method: 'PATCH',
    token: tokenOrg2,
    body: { status: 'rejected' }
  });
  if (crossOrgRes.status === 404) {
    console.log('✓ 16. Cross-organization isolation enforced (Org 2 cannot modify Org 1 application).');
  } else {
    throw new Error(`Cross-org isolation failed, status: ${crossOrgRes.status}`);
  }

  // 17. Rejection flow test with Candidate 2 on Opportunity 2
  const apply2 = await request(`/applications/${opp2._id}`, { method: 'POST', token: tokenCand2 });
  const appId2 = apply2.data.data._id;
  const rejectRes = await request(`/organization/applications/${appId2}/status`, {
    method: 'PATCH',
    token: tokenOrg2,
    body: { status: 'rejected', note: 'Not enough Linux experience' }
  });
  if (!rejectRes.ok || rejectRes.data.data.status !== 'rejected') {
    throw new Error(`Rejection status update failed: ${JSON.stringify(rejectRes.data)}`);
  }
  const cand2Notifs = await request('/notifications', { token: tokenCand2 });
  const rejectNotif = cand2Notifs.data.data.find(n => n.type === 'application_rejected');
  if (!rejectNotif || !rejectNotif.message.includes('was not selected')) {
    throw new Error(`Rejection notification missing: ${JSON.stringify(cand2Notifs.data)}`);
  }
  console.log(`✓ 17. Rejection flow tested: Candidate 2 received notification: "${rejectNotif.message}"`);

  console.log('====================================================');
  console.log('ALL E2E CANDIDATE APPLICATION TRACKING TESTS PASSED!');
  console.log('====================================================');
  process.exit(0);
}

runTest().catch((err) => {
  console.error('TEST FAILED:', err);
  process.exit(1);
});
