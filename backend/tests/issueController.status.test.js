const test = require('node:test');
const assert = require('node:assert/strict');

const { changeStatus } = require('../controllers/issueController');
const Issue = require('../models/Issue');

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

test('admin can change status of another user issue', async () => {
  const issue = {
    _id: '507f1f77bcf86cd799439011',
    createdBy: '507f1f77bcf86cd799439012',
    status: 'Open',
    statusHistory: [],
    save: async function () {
      this.status = 'In Progress';
      this.statusHistory.push({ status: 'In Progress' });
    }
  };
  const query = { ...issue, populate() { return this; } };

  const originalFindById = Issue.findById;
  Issue.findById = () => query;

  const req = {
    params: { id: '507f1f77bcf86cd799439011' },
    body: { status: 'In Progress', comment: 'Investigating the issue' },
    user: { _id: '507f1f77bcf86cd799439013', role: 'admin' }
  };
  const res = buildRes();

  try {
    await changeStatus(req, res);
    assert.equal(res.statusCode, 200);
    assert.equal(query.status, 'In Progress');
  } finally {
    Issue.findById = originalFindById;
  }
});

test('non-admin cannot change status on another user issue', async () => {
  const issue = {
    _id: '507f1f77bcf86cd799439021',
    createdBy: '507f1f77bcf86cd799439022',
    status: 'Open',
    statusHistory: [],
    save: async function () {
      this.status = 'Closed';
      this.statusHistory.push({ status: 'Closed' });
    }
  };
  const query = { ...issue, populate() { return this; } };

  const originalFindById = Issue.findById;
  Issue.findById = () => query;

  const req = {
    params: { id: '507f1f77bcf86cd799439021' },
    body: { status: 'Closed', comment: 'Updating issue status' },
    user: { _id: '507f1f77bcf86cd799439023', role: 'user' }
  };
  const res = buildRes();

  try {
    await changeStatus(req, res);
    assert.equal(res.statusCode, 403);
    assert.equal(query.status, 'Open');
  } finally {
    Issue.findById = originalFindById;
  }
});
