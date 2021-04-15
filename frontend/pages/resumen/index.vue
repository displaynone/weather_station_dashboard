<template>
	<div>
		<DailyWidgets />
		<WeekWidgets />
		<TemperaturePressureWidget />
	</div>
</template>

<script>
import DailyWidgets from './daily';
import WeekWidgets from './week';
import TemperaturePressureWidget from './temperature-pressure';

export default {
	components: {
		DailyWidgets,
		WeekWidgets,
		TemperaturePressureWidget,
	},
	fetchOnServer: false,
}
</script>
