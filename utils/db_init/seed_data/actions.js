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
				stopAfterRepetitionCount: undefined
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
						durationType: 'weeks',
						duration: 15, // 15 min in millisecond
						message: "Turn pump off for 15 minutes"
					}
				],
				stopAfterRepetitionCount : undefined
			}
		}, // end "Water pump cycle" action	
		{
			description: "Turn light on and off.",
			control: "savedObjectIds['lights']['fluorescent']",
			cycle: {
				states: [
					{
						controlValue: 1,
						durationType: 'hours',
						duration: 6,
						message: "Turn light on."
					},
					{
						controlValue: 0,
						durationType: 'hours',
						duration: 20,
						message: "Turn light off."
					}
				],
				stopAfterRepetitionCount : undefined
			}
		},
		{
			description: "Light levels have dropped. Turn on supplemental lighting.",
			control: "savedObjectIds['lights']['fluorescent']",
			cycle: {
				states: [
					{
						controlValue: 255,
						message: "Light levels have dropped. Turn on supplemental lighting.",
					}
				],
				stopAfterRepetitionCount: 1
			}
		},
		{
			description: "Light levels above recommendations. Turn off any supplemental lights.",
			control: "savedObjectIds['lights']['fluorescent']",
			cycle: {
				states: [
					{
						controlValue: 0,
						message: "Light levels above recommendations. Turn off any supplemental lights."
					}
				],
				stopAfterRepetitionCount: 1
			}
		},
		{
			description: "Air temperature is too high. Turn on air conditioner.",
			control: "savedObjectIds['controls']['Air Conditioner']",
			cycle: {
				states: [
					{
						controlValue: 255,
						message: "Air temperature is too high. Turn on air conditioner."
					}
				],
				stopAfterRepetitionCount: 1
			}
		},
		{
			description: "Air temperature is too low. Turn on heater.",
			control: "savedObjectIds['controls']['Heater']",
			cycle: {
				states: [
					{
						controlValue: 255,
						message: "Air temperature is too low. Turn on heater."
					}
				],
				stopAfterRepetitionCount: 1
			}
		},
		{
			description: "Pollinate any new blossoms using a watercolor brush to distribute",
			control: undefined,
			cycle: undefined
		}

	]