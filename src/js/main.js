const ko = require("knockout");
require("knockout.validation");

const createUser = require("sdk");

ko.validation.rules.pattern.message = "Invalid.";

ko.validation.configure({
    registerExtenders: true,
    messagesOnModified: true,
    insertMessages: true,
    parseInputAttributes: true,
    messageTemplate: null
});

function fieldViewModel(
  stepId,
  name,
  label,
  value,
  template,
  validation,
  props
) {
  //if (!validate)
  //let validate = () => {};
  let self = {
    name,
    stepId,
    val: ko.observable(value).extend(validation),
    template: ko.observable(template),
    label: ko.observable(label),
    visible: ko.observable(true),
    props
  };
  self.__isValid = function() {
    //return true;
    return self.val.isModified() ? self.val.isValid() : true;
  };
  return self;
}

var viewModel = {
  currentStepId: ko.observable(0),
  fields: ko.observableArray([
    fieldViewModel(
      0,
      "name",
      "Name",
      "",
      "inputTemplate",
      {
        required: true,
        minLength: 3
      },
      {
        placeholder: ko.observable("eg: John Smith"),
        type: ko.observable("string")
      }
    ),
    fieldViewModel(
      0,
      "age",
      "Age",
      18,
      "inputTemplate",
      {
        min: 18,
        required: true
      },
      {
        placeholder: ko.observable("Your age"),
        type: ko.observable("number")
      }
    ),
    fieldViewModel(
      1,
      "email",
      "Email",
      "",
      "inputTemplate",
      {
        required: true,
        email: true
      },
      {
        placeholder: ko.observable("eg: JohnSmith@gmail.com"),
        type: ko.observable("email")
      }
    ),
    fieldViewModel(
      1,
      "newsletter",
      "Newsletter",
      "daily",
      "selectTemplate",
      {
        required: true
      },
      {
        optionsCaption: ko.observable("Choose a period"),
        options: ko.observableArray(["daily", "weekly", "monthly"])
      }
    )
  ]),
  completed: ko.observable(false),
  handleSubmit: () => {
    const stepId = viewModel.currentStepId();
    const filteredViewModel = {};
    viewModel
      .steps()
      [stepId].fields()
      .map(field => {
        filteredViewModel[field.name] = field.val;
      });
    const formViewModel = ko.validatedObservable(filteredViewModel);
    if (!formViewModel.isValid()) {
      alert("Please complete the form");
      return false;
    }
    if (stepId + 1 < viewModel.steps().length) {
      viewModel.currentStepId(stepId + 1);
    } else {
      //completed all steps
      const user = {};
      viewModel.fields().map(field => {
        user[field.name] = field.val();
      });
      console.log("user :", user);

      createUser(user)
        .then(function() {
          viewModel.completed(true);
        })
        .catch(function() {
          alert("somthing went wrong please try again in a moment");
        });
    }
  },
  prev: () => {
    viewModel.currentStepId(viewModel.currentStepId() - 1);
  }
};

//const vViewModel = kov.validatedObservable(viewModel)
viewModel.steps = ko.observableArray([
  {
    btnText: ko.observable("Next"),
    fields: ko.observableArray(
      viewModel.fields().filter(field => field.stepId === 0)
    )
  },
  {
    btnText: ko.observable("Create"),
    fields: ko.observableArray(
      viewModel.fields().filter(field => field.stepId === 1)
    )
  }
]);

var appElement = document.getElementById("app");
ko.applyBindings(viewModel, appElement);
