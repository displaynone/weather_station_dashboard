<template>
	<div>
		<h2>Esta semana</h2>
		<CRow class="row">
			<CCol class="col day" v-for="( day, index ) in data" :key="index">
				<CCard
					color="primary"
					class="text-center"
					body-wrapper
					text-color="white"
				>
					<blockquote class="card-blockquote">
						<div class="h5">{{ day.day }} {{ daysLabels[ index ] }}</div>
						<div><CIcon :height="10" name="cilCaretTop"/> {{ day.maxTemperature  === Number.MIN_SAFE_INTEGER ? '-' : `${ day.maxTemperature } ºC` }}</div>
						<div><CIcon :height="10" name="cilCaretBottom"/> {{ day.minTemperature  === Number.MAX_SAFE_INTEGER ? '-' : `${ day.minTemperature } ºC` }}</div>
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
			daysLabels: [ 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom' ],
		}
	},
	async fetch() {
		const today = new Date();
		// const today = new Date( 2021, 2, 8 );
		const weekData = await this.$axios.$get(
			process.env.apiServer + `data/group-by-week?day=${ today.getDate() }&month=${ today.getMonth() + 1 }&year=${ today.getFullYear() }&lastdays=true`
		);
		const defaultValue = {
			minTemperature: Number.MAX_SAFE_INTEGER,
			maxTemperature: Number.MIN_SAFE_INTEGER,
			humidity: 0,
			pressure: 0,
		};
		const emptyArray = ( new Array( 7 ) ).fill( null ).map( () => {
			return { ... defaultValue }
		} );
		const result = [ ... emptyArray ];
		const numberItemsByDay = new Array( 7 ).fill( 0 );
		weekData.forEach( item => {
			const index = 6 - ( today.getDate() - item.day_of_month );
			result[ index ].minTemperature = Math.min( result[ index ].minTemperature, item.temperature );
			result[ index ].maxTemperature = Math.max( result[ index ].maxTemperature, item.temperature );
			result[ index ].humidity += item.humidity;
			result[ index ].pressure += item.pressure;
			result[ index ].isToday = today.getDay() === item.day_of_week;
			result[ index ].day = new Date( item.createdAt ).getDate() + 1;
			numberItemsByDay[ index ]++;
		} );
		result.map( ( item, index ) => {
			return {
				maxTemperature: item.maxTemperature,
				minTemperature: item.minTemperature,
				humidity: item.humidity / numberItemsByDay[ index ],
				pressure: item.pressure / numberItemsByDay[ index ],
			};
		} );
		this.data = result;
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

	.card-body {
		padding: 0.25rem;
	}
</style>
