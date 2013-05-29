/**
 * This module is used to key into the i18n values elsewhere in the i18n folder.
 *
 * Used to store any strings that are used multiple places in the code or that
 * may be exposed to the user.
 *
 * Ensures that we don't accidentally change a string one place in the code without updating it elsewhere.
 * 
 * Supports strings with printf-like functionality (placeholders which are populated at call time)
 */

var nodeUtil = require('util');

exports.keys = {
  "An action with a control must define a cycle with 1 or more control states" : "An action with a control must define a cycle with 1 or more control states",
  "Invalid number of cycle states" : "Invalid number of cycle states",
  "If an action has a control, every cycle state must specify a control value" : "If an action has a control, every cycle state must specify a control value",
  "In a 2-state cycle, at least one state must have a duration defined" : "In a 2-state cycle, at least one state must have a duration defined",
  "First and last control values must be equal" : "First and last control values must be equal",
  "First and last state\'s messages must be equal" : "First and last state\'s messages must be equal",
  "In a 3-state cycle, at least the 1st and 3rd states must have durations defined" : "In a 3-state cycle, at least the 1st and 3rd states must have durations defined",
  "Invalid action id" : "Invalid Action id",
  "Invalid Grow Plan id" : "Invalid Grow Plan id %s",
  "manual action trigger message" : "%s. %s.",
  "device action trigger message" : "%s. Your device has automatically handled the following action : %s.",
  "unavailable device key" : "%s does not match any available device keys for this user",
  "no device" : "No device found for specified id %s",
  "Only device owner can assign a device to their garden" : "Only device owner can assign a device to their garden",
  "No active grow plan instance found for device" : "No active grow plan instance found for device",
  "No active phase found for this grow plan instance" : "No active phase found for this grow plan instance",
  "Bitponics Notification" : "Bitponics Notification",
  "Action Needed" : "Action Needed",
  "Time for the following action" : "Time for the following action: %s.",
  "Since you have a control connected" : "Since you have a %s connected, we\'ve triggered this automatically.",
  "Has repeating cycle" : "This action has a repeating cycle associated with it. We'll notify you whenever an action is required.",
  "As part of the following action" : 'As part of the following action: "%s", it\'s time to take the following step: "%s"',
  "A GrowPlanInstance can only be migrated..." : "A GrowPlanInstance can only be migrated to a GrowPlan that is branched off the previous GrowPlanInstance's GrowPlan",
  "Grow Plan Updated, failed migration title" : "Your grow plan was updated, but we couldn't automatically find a matching phase for your garden.",
  "Grow Plan Updated, failed migration body" : "Your garden has not been changed. To view the update and decide if you want to migrate your garden, click the link below.",
  "Grow Plan Updated, automatic migration title" : "Your grow plan was updated.",
  "Grow Plan Updated, automatic migration body" : "We've automatically updated your garden to use the latest version.",
  "It's almost time" : "It's almost time for the %s phase.",
  "Log into dashboard to advance" : "Log into your dashboard to advance your grow plan to the next phase."
};

/**
 *
 * @param key {String}. The key of the requested string.
 * @param [...] {String}. optional. Rest of arguments are strings which replace placeholders in the requested string
 */
exports.get = function(key){
  var val = exports.keys[key],
      args;
  if (!val){ return "Invalid i18n key"; }
  
  if (arguments.length > 1){
    // turn arguments into an array
    args = Array.prototype.slice.call(arguments);
    // then call nodeUtil's placeholder replacement 
    val = nodeUtil.format.apply(null, [val].concat(args.slice(1))); 
  }
  return val;
}