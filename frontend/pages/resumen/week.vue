<template>
	<div>
		<h2>Esta semana</h2>
		<CRow>
			<CCol sm="1" v-for="( day, index ) in data" :key="index">
				<CCard
					color="primary"
					class="text-center"
					body-wrapper
					text-color="white"
				>
					<blockquote class="card-blockquote">
						<div class="h2">{{ day.day }} {{ daysLabels[ index ] }}</div>
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
		const weekData = await this.$axios.$get(
			process.env.apiServer + `data/group-by-week?day=${ today.getDate() }&month=${ today.getMonth() + 1 }&year=${ today.getFullYear() }`
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
			const index = item.day_of_week;
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
		console.log(result);
	},
	fetchOnServer: false,
};
</script>

<style scoped>
	.col-sm-1 {
		max-width: calc(100%/7);
		flex: 0 0 calc(100%/7);
	}

	.card-body {
		padding: 0.25rem;
	}
</style>
