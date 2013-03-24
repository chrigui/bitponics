window.Steps = (function( window, document, undefined ) {
    
    var version = '0.1',

    STEPS_FORM_CLASS = '.steps',

    STEP_CLASS = '.step',

    CURRENT_STEP_CLASS = '',

    NEXT_STEP_BUTTON_CLASS = '.next-step-btn',

    //UPDATE_PANEL_CLASS = '.update-panel',

    initialStepIndex = 0,

    doScroll = true,
    
    Steps = {};

    (function () {
      Steps.form = $('form' + STEPS_FORM_CLASS);
      Steps.steps = Steps.form.find(STEP_CLASS);
      Steps.currentStepIndex = initialStepIndex;
      Steps.currentStep = Steps.steps.eq(Steps.currentStepIndex);
      //Steps.updatePanel = Steps.steps.find(UPDATE_PANEL_CLASS);
      Steps.stepsInteractedWith = {};
      Steps.stepsInvalid = {};
      Steps.validate = validate;
      initEventHandlers();
      setInitialStepStyles();
    })();
    
    function initEventHandlers() {
      // Steps.form.on('change blur', ':input', validate);
      // Steps.form.on('click change', NEXT_STEP_BUTTON_CLASS, validate);
      $(NEXT_STEP_BUTTON_CLASS).on('click', validate);
    }

    function setInitialStepStyles() {
      Steps.currentStep.find(':input').removeAttr('disabled');
      
      Steps.steps.filter(':gt(' + Steps.currentStepIndex + ')')
        .addClass('hide')
        .find(':input:not(.no-disable)')
        // .attr('disabled', true);
        
    }

    function validate(e) {
      var activeStep, nextStep;

      if(e){
        activeStep = $(e.target).closest('.step') 
      }else{
        activeStep = Steps.currentStep;
      }
      
      nextStep = activeStep.next(STEP_CLASS);
      
      if (!Steps.stepsInteractedWith[activeStep.index()]) {
        //add to list of steps user has interacted with and scroll to next
        Steps.stepsInteractedWith[activeStep.index()] = activeStep;
        if (doScroll && nextStep.length) {
          scrollToNextSection(nextStep.offset().top);
          Steps.currentStep = nextStep;
          Steps.currentStepIndex = nextStep.index();
        }
      }

      //loop through all interacted with steps and validate them
      var steps = Steps.stepsInteractedWith;
      for(var step in steps) {
        if (isValidStep(steps[step])) {
          steps[step].addClass('complete hide');
          if (nextStep.length) {
            steps[step].next(STEP_CLASS).removeClass('dim hide').find(':input').removeAttr('disabled');
          }
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

    //TODO: rename/refactor for different transition
    function scrollToNextSection( top ) {
      scrollTo(0, 0);
      // var delay = 0;
      // setTimeout(function(){
      //   $('html, body').animate({
      //     scrollTop: top
      //   }, 1000);
      // }, delay)
    }

    Steps._version = version;

    return Steps;

})(this, this.document);