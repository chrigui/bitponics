module.exports = [
		{
			description: "Transplant seedlings into the grow bed",
			control: undefined,
			cycle: undefined
		},
		{
			description: "Flush and refill reservoir. Discard any solution in the reservoir, rinse the entire system with water. Then refill the reservoir to capacity with water. Mix in ¼ cup Grow nutrient, then ¼ cup Bloom nutrient, then ¼ cup Micro nutrient.",
			control: undefined,
			cycle: {
				states: [
					{
						controlValue: undefined,
						durationType: 'untilPhaseEnd',
						duration: undefined,
						message: "Flush and refill reservoir. Discard any solution in the reservoir, rinse the entire system with water. Then refill the reservoir to capacity with water. Mix in ¼ cup Grow nutrient, then ¼ cup Bloom nutrient, then ¼ cup Micro nutrient."
					}
				],
				repeat: true
			}
		}, // end flush Action
		{
			description: "Water pump cycle",
			control: "savedObjectIds['controls']['Water Pump']", // reference to Pump control
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
			description: "Light cycle, with lights on between 6am and 10pm.",
			control: "savedObjectIds['controls']['Light']",
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
			description: "Turn on supplemental lighting.",
			control: "savedObjectIds['controls']['Light']",
			cycle: {
				states: [
					{
						controlValue: 255,
						message: "Light levels have dropped. Turn on supplemental lighting.",
					}
				],
				repeat : false
			}
		},
		{
			description: "Turn off any supplemental lights.",
			control: "savedObjectIds['controls']['Light']",
			cycle: {
				states: [
					{
						controlValue: 0,
						message: "Light levels above recommendations. Turn off any supplemental lights."
					}
				],
				repeat : false
			}
		},
		{
			description: "Turn on air conditioner.",
			control: "savedObjectIds['controls']['Air Conditioner']",
			cycle: {
				states: [
					{
						controlValue: 255,
						message: "Air temperature is too high. Turn on air conditioner."
					}
				],
				repeat : false
			}
		},
		{
			description: "Turn on heater.",
			control: "savedObjectIds['controls']['Heater']",
			cycle: {
				states: [
					{
						controlValue: 255,
						message: "Air temperature is too low. Turn on heater."
					}
				],
				repeat: false
			}
		},
		{
			description: "Pollinate any new blossoms using a watercolor brush to distribute",
			control: undefined,
			cycle: undefined
		}

	]