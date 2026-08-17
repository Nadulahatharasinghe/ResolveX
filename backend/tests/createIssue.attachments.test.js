const test = require('node:test');
const assert = require('node:assert/strict');

const { createIssue } = require('../controllers/issueController');
const Issue = require('../models/Issue');
const User = require('../models/User');

function buildRes() {
  return {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      return data;
    }
  };
}

test('createIssue accepts uploaded attachments and saves them', async () => {
  const originalCreate = Issue.create;
  const originalFindById = Issue.findById;
  const originalUserFindById = User.findById;

  const createdIssue = {
    _id: 'issue-attachments-1',
    title: 'Upload test',
    description: 'Need screenshot',
    issueType: 'Bug',
    priority: 'High',
    status: 'Open',
    assignee: null,
    dueDate: null,
    attachments: [{
      name: 'screen.png',
      type: 'image/png',
      size: 123,
      dataUrl: 'data:image/png;base64,AAA='
    }],
    createdBy: 'user-1'
  };

  Issue.create = async (doc) => ({ ...createdIssue, ...doc });
  const query = {
    ...createdIssue,
    populate() { return this; }
  };
  Issue.findById = () => query;
  User.findById = async () => null;

  const req = {
    body: {
      title: 'Upload test',
      description: 'Need screenshot',
      issueType: 'Bug',
      priority: 'High',
      status: 'Open',
      assignee: '',
      dueDate: '',
      attachments: [{
        name: 'screen.png',
        type: 'image/png',
        size: 123,
        dataUrl: 'data:image/png;base64,AAA='
      }]
    },
    user: { _id: 'user-1' }
  };
  const res = buildRes();

  try {
    await createIssue(req, res);
    assert.equal(res.statusCode, 201);
    assert.equal(res.body.data.attachments.length, 1);
    assert.equal(res.body.data.attachments[0].name, 'screen.png');
  } finally {
    Issue.create = originalCreate;
    Issue.findById = originalFindById;
    User.findById = originalUserFindById;
  }
});
