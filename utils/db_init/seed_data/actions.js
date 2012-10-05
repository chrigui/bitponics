var ObjectId = mongoose = require('mongoose').Schema.ObjectId;

module.exports = [
		{
			_id : '506de2ec8eebf7524342cb24',
			description: "Transplant seedlings into the grow bed",
			control: undefined,
			cycle: undefined
		},
		{
			_id : '506de2ef8eebf7524342cb25',
			description: "Flush and refill reservoir. Discard any solution in the reservoir, rinse the entire system with water. Then refill the reservoir to capacity with water. Mix in ¼ cup Grow nutrient, then ¼ cup Bloom nutrient, then ¼ cup Micro nutrient.",
			control: undefined,
			cycle: {
				states: [
					{
						controlValue: undefined,
						durationType: 'untilPhaseEnd',
						duration: undefined
					},
					{
						controlValue: undefined,
						durationType: 'minutes',
						duration: '15',
						message: "Flush and refill reservoir. Discard any solution in the reservoir, rinse the entire system with water. Then refill the reservoir to capacity with water. Mix in ¼ cup Grow nutrient, then ¼ cup Bloom nutrient, then ¼ cup Micro nutrient."
					},
				],
				repeat: false
			}
		}, // end flush Action
		{
			_id : '506de2f08eebf7524342cb26',
			description: "Water pump cycle",
			control: "506de2fc8eebf7524342cb2d", // reference to Pump control
			cycle: {
				states: [
					{
						controlValue: 1,
						durationType: 'minutes',
						duration: 15, // 15 min in milliseconds
						message: "Turn pump on for 15 minutes"
					},
					{
						controlValue: 0,
						durationType: 'minutes',
						duration: 15, // 15 min in millisecond
						message: "Turn pump off for 15 minutes"
					}
				],
				repeat: true
			}
		}, // end "Water pump cycle" action	
		{
			_id : '506de2f18eebf7524342cb27',
			description: "Light cycle, with lights on between 6am and 10pm.",
			control: "506de2fd8eebf7524342cb32",
			cycle: {
				states: [
					// start the day with 6 hours off
					{
						controlValue: 1,
						durationType: 'hours',
						duration: 6,
						message: "Turn light off."
					},
					{
						controlValue: 0,
						durationType: 'hours',
						duration: 16,
						message: "Turn light on."
					},
					// finish off the 24 hour day with off
					{
						controlValue: 1,
						durationType: 'hours',
						duration: 2,
						message: "Turn light off."
					}
				],
				repeat: true
			}
		},
		{
			_id : '506de2fb8eebf7524342cb28',
			description: "Turn on supplemental lighting.",
			control: "506de2fd8eebf7524342cb32",
			cycle: {
				states: [
					{
						controlValue: 255,
						message: "Turn on supplemental lighting.",
					}
				],
				repeat : false
			}
		},
		{
			_id : '506de2fb8eebf7524342cb29',
			description: "Turn off any supplemental lights.",
			control: "506de2fd8eebf7524342cb32",
			cycle: {
				states: [
					{
						controlValue: 0,
						message: "Turn off any supplemental lights."
					}
				],
				repeat : false
			}
		},
		{
			_id : '506de2fb8eebf7524342cb2a',
			description: "Turn on air conditioner.",
			control: "506de2fd8eebf7524342cb31",
			cycle: {
				states: [
					{
						controlValue: 255,
						message: "Turn on air conditioner."
					}
				],
				repeat : false
			}
		},
		{
			_id : '506de2fc8eebf7524342cb2b',
			description: "Turn on heater.",
			control: "506de2fc8eebf7524342cb2f",
			cycle: {
				states: [
					{
						controlValue: 255,
						message: "Turn on heater."
					}
				],
				repeat: false
			}
		},
		{
			_id : '506de2fc8eebf7524342cb2c',
			description: "Pollinate any new blossoms using a watercolor brush to distribute",
			control: undefined,
			cycle: undefined
		}

	]