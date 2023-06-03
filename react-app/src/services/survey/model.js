import './style.css'
export const questionnaire = {
  elements: [{
    name: 'FirstName',
    title: 'Enter your first name:',
    type: 'text'
  }, {
    name: 'LastName',
    title: 'Enter your last name:',
    type: 'text'
  }, {
    name: 'SkinConditions',
    title: 'Do you have any skin conditions?',
    type: 'checkbox',
    choices: ['Eczema', 'Rosacea', 'Psoriasis', 'Acne']  // Add the skin conditions here
  }]
};
