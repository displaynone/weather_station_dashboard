<template>
	<div>
		<h2>Esta semana</h2>
		<CRow class="row">
			<CCol class="col day" v-for="( day, index ) in data" :key="index">
				<CCard
					:color="day.isToday ? 'primary' : 'secondary'"
					class="text-center"
					body-wrapper
					text-color="white"
				>
					<blockquote class="card-blockquote">
						<div class="h3">{{ day.day }}</div>
						<div class="h6">{{ daysLabels[ day.day_of_week ] }}</div>
						<div>
							<span class="normal">{{ day.maxTemperature  === Number.MIN_SAFE_INTEGER ? '-' : `${ day.maxTemperature } º` }}</span>
							<span class="heat">{{ day.minTemperature  === Number.MAX_SAFE_INTEGER ? '-' : `${ day.minTemperature } º` }}</span>
						</div>
					</blockquote>
				</CCard>
			</CCol>
		</CRow>
	</div>
</template>

<script>
// import { cilCaretTop } from '@coreui/icons';

export default {
	name: "WeekWidgets",
	// icons: { cilCaretTop },
	data() {
		return {
			data: [],
			daysLabels: [ 'Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb' ],
		}
	},
	async fetch() {
		const today = new Date();
		// const today = new Date( 2021, 2, 23 );
		const weekData = await this.$axios.$get(
			process.env.apiServer + `data/group-by-week?day=${ today.getDate() }&month=${ today.getMonth() + 1 }&year=${ today.getFullYear() }&lastdays=true`
		);
		const defaultValue = {
			minTemperature: Number.MAX_SAFE_INTEGER,
			maxTemperature: Number.MIN_SAFE_INTEGER,
			humidity: 0,
			pressure: 0,
		};
		const result = [];
		const numberItemsByDay = new Array( 7 ).fill( 0 );
		weekData.forEach( item => {
			const index = item.day_of_month;
			if ( ! result[ index ] ) {
				result[ index ] = { ... defaultValue };
			}
			result[ index ].index = index;
			result[ index ].minTemperature = Math.min( result[ index ].minTemperature, item.temperature );
			result[ index ].maxTemperature = Math.max( result[ index ].maxTemperature, item.temperature );
			result[ index ].humidity += item.humidity;
			result[ index ].pressure += item.pressure;
			result[ index ].day_of_week = item.day_of_week;
			result[ index ].isToday = today.getDay() === item.day_of_week;
			result[ index ].day = new Date( item.createdAt ).getDate();
			numberItemsByDay[ index ]++;
		} );
		this.data = result.filter( item => item !== null );
		console.log(JSON.stringify(this.data, null, 2));
	},
	fetchOnServer: false,
};
</script>

<style scoped>
	@media (max-width: 768px) {
		.day {
			min-width: calc( 100% / 3);
			max-width: calc( 100% / 3);
		}
	}

	@media (min-width: 786px) and (max-width: 992px) {
		.day {
			min-width: calc( 100% / 4);
			max-width: calc( 100% / 4);
		}
	}

	h2 {
		text-transform: uppercase;
		padding-bottom: 0.8em;
		text-align: center;
	}

	.card-body {
		padding: 0.25rem;
	}

	.normal {
		font-weight: 500;
	}

	.heat {
		color: rgba( 255, 255, 255, 0.6 );
	}
</style>
