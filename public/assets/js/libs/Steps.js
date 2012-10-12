window.Steps = (function( window, document, undefined ) {
    
    var version = '0.1',

    STEPS_FORM_CLASS = '.steps',

    STEP_CLASS = '.step',

    CURRENT_STEP_CLASS = '',

    UPDATE_PANEL_CLASS = '.update-panel',

    initialStepIndex = 0,
    
    Steps = {};

    (function () {
      Steps.form = $('form' + STEPS_FORM_CLASS);
      Steps.steps = Steps.form.find(STEP_CLASS);
      Steps.currentStepIndex = initialStepIndex;
      Steps.currentStep = Steps.steps.eq(Steps.currentStepIndex);
      Steps.updatePanel = Steps.steps.find(UPDATE_PANEL_CLASS);
      Steps.stepsInteractedWith = {};
      Steps.stepsInvalid = {};
      initEventHandlers();
      setInitialStepStyles();
    })();
    
    function initEventHandlers() {
      Steps.form.on('change blur', ':input', validate);
    }

    function setInitialStepStyles() {
      Steps.currentStep.find(':input').removeAttr('disabled');
      Steps.steps.filter(':gt(' + Steps.currentStepIndex + ')')
        .addClass('dim')
        .find(':input')
        .attr('disabled', true);
    }

    function validate(e) {
      var activeStep = $(e.target).closest('.step');
      
      if (!Steps.stepsInteractedWith[activeStep.index()]) {
        //add to list of steps user has interacted with and scroll to next
        Steps.stepsInteractedWith[activeStep.index()] = activeStep;
        $('html, body').animate({
          scrollTop: activeStep.next().offset().top
        }, 1000);
      }

      //loop through all interacted with steps and validate them
      var steps = Steps.stepsInteractedWith;
      for(var step in steps) {
        if (isValidStep(steps[step])) {
          steps[step].addClass('complete');
          steps[step].next().removeClass('dim hide').find(':input').removeAttr('disabled');
          delete Steps.stepsInvalid[steps[step]]; //remove from invalid
        } else {
          steps[step].addClass('error');
          Steps.stepsInvalid[steps[step].index()] = (steps[step]); //add to invalid
        }
      }

      // if (Steps.stepsInvalid.length == 0) {
      //   updateResults();
      // }
    }

    // function updateResults() {
    //   console.log('filter results');
    //   Steps.updatePanel();
    // }

    function isValidStep(step) {
      var isRequired = step.attr('data-required'),
        isValid = false;

      if (isRequired) {
        step.find(':input').each(function (index) {
          var input = $(this),
            type = input.attr('type'),
            nameGroupCheckedNum = findByName(input.attr('name')).filter(':checked').length;

          if (!input.hasClass('no-validate')) {
            if (type == 'radio' || type == 'checkbox') {
              isValid = (nameGroupCheckedNum >= isRequired);
            } else {
              isValid = (elementValue(input) !== '');
            }
          }

        });
      } else {
        isValid = true;
      }

      return isValid;
    }

    function elementValue( element ) {
      var type = $(element).attr('type'),
        val = $(element).val();

      if ( type === 'radio' || type === 'checkbox' ) {
        return $('input[name="' + $(element).attr('name') + '"]:checked').val();
      }

      if ( typeof val === 'string' ) {
        return val.replace(/\r/g, "");
      }
      return val;
    }

    function findByName( name ) {
      return Steps.form.find('[name="' + name + '"]');
    }

    Steps._version = version;

    return Steps;

})(this, this.document);