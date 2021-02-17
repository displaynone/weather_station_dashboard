<template>
	<div>
		<DailyWidgets />
		<WeekWidgets />
	</div>
</template>

<script>
import DailyWidgets from './daily';
import WeekWidgets from './week';

export default {
	components: {
		DailyWidgets,
		WeekWidgets,
	},
	fetchOnServer: false,
}
</script>
