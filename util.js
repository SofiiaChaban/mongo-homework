const faker = require('faker');

const generateUser = ({
  firstName = faker.name.firstName(),
  lastName = faker.name.lastName(),
  department,
  createdAt = new Date()
} = {}) => ({
  firstName,
  lastName,
  department,
  createdAt
});

const generateArticle = ({
  articleName = 'sampleName',
  description = 'sampleDescr',
  type,
  tags = ['sampleTag1','sampleTag2']
} = {}) => ({
  articleName,
  description,
  type,
  tags
});

module.exports = {
  mapUser: generateUser,
  mapArticle: generateArticle,
  getRandomFirstName: () => faker.name.firstName()
};
