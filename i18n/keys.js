/*
 * This module is used to key into the i18n values elsewhere in the i18n folder.
 * Used to store any strings that are used multiple places in the code or that
 * may be exposed to the user.
 *
 * Ensures that we don't accidentally change a string one place in the code without updating it elsewhere.
 */


exports.keys = {
  "An action with a control must define a cycle with 1 or more control states" : "An action with a control must define a cycle with 1 or more control states",
  "Invalid number of cycle states" : "Invalid number of cycle states",
  "If an action has a control, every cycle state must specify a control value" : "If an action has a control, every cycle state must specify a control value",
  "In a 2-state cycle, at least one state must have a duration defined" : "In a 2-state cycle, at least one state must have a duration defined",
  "First and last control values must be equal" : "First and last control values must be equal",
  "First and last state\'s messages must be equal" : "First and last state\'s messages must be equal",
  "In a 3-state cycle, at least the 1st and 3rd states must have durations defined" : "In a 3-state cycle, at least the 1st and 3rd states must have durations defined"

};

exports.get = function(key){
  return exports.keys[key] || "Invalid i18n key";
}