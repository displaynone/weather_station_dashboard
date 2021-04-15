<template>
	<div>
		<h2>Esta semana</h2>
		<CRow class="row">
			<CCol class="col day" v-for="( day, index ) in data" :key="index">
				<CCard
					:color="day.isToday ? 'primary' : 'secondary'"
					class="text-center"
					body-wrapper
					:text-color="day.isToday ? 'white' : 'black'"
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
import { getColor } from '@coreui/utils/src'

const yAxes = {
	display: true,
	gridLines: {
		display: false,
	},
	ticks: {
		fontColor: 'rgba( 255, 255, 255, 0.9 )',
		fontSize: 14,
		stepSize: 2,
		beginAtZero: false,
	}
};

export default {
	name: "WeekWidgets",
	// icons: { cilCaretTop },
	data() {
		return {
			data: [],
			daysLabels: [ 'Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado' ],
			temperature: [],
			pressure: [],
			labels: [],
			options: {
				scales: {
					yAxes: [
						{
							id: 'pressure',
							... yAxes,
							position: 'right',
						},
						{
							id: 'temperature',
							... yAxes,
						},
					],
					xAxes: [
						{
							display: true,
							ticks: {
								fontColor: 'rgba( 255, 255, 255, 0.9 )',
								fontSize: 14,
								stepSize: 2,
								beginAtZero: false,
							},
						},
					],
				},
				elements: {
					point: {
						radius: 0,
					},
				},
			},
		}
	},
	computed: {
		temperaturePressureDatasets: function() {
			return [
				{
					yAxisID: 'pressure',
					data: this.pressure,
					borderColor: getColor( 'rgba(255, 255, 255, 0.7)' ),
					borderWidth: 2,
					borderCapStyle: 'square',
					backgroundColor: getColor( 'transparent' ),
					type: 'line',
					label: 'hPa',
					tooltipLabelColor: getColor( 'rgba(255, 255, 255, 0.7)' ),
				}, {
					yAxisID: 'temperature',
					data: this.temperature,
					type: 'line',
					borderColor: getColor( 'rgba(0, 0, 0, 0.7)' ),
					borderWidth: 2,
					backgroundColor: getColor( 'transparent' ),
					tooltipLabelColor: getColor( 'rgba(0, 0, 0, 0.7)' ),
				},
			];
		},
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
		let prevHour = -1;
		let minTemperature = Number.MAX_SAFE_INTEGER;
		let maxTemperature = Number.MIN_SAFE_INTEGER;
		let prevLabel = '';
		weekData.forEach( item => {
			const date = new Date( item.createdAt );
			const index = parseInt( date.toISOString().split( 'T' )[ 0 ].replace( /-/g, '' ) );
			if ( ! result[ index ] ) {
				result[ index ] = { ... defaultValue };
			}
			result[ index ].index = index;
			result[ index ].minTemperature = Math.min( result[ index ].minTemperature, item.temperature );
			result[ index ].maxTemperature = Math.max( result[ index ].maxTemperature, item.temperature );
			result[ index ].humidity += item.humidity;
			result[ index ].pressure += item.pressure;
			result[ index ].day_of_week = date.getUTCDay();
			result[ index ].isToday = today.getUTCDay() === date.getUTCDay();
			result[ index ].day = date.getUTCDate();
			if ( date.getHours() - prevHour > 4 ) {
				this.temperature.push( item.temperature );
				this.pressure.push( item.pressure );
				if ( prevLabel !== this.daysLabels[ date.getUTCDay() ] ) {
					this.labels.push( this.daysLabels[ date.getUTCDay() ] );
				} else {
					this.labels.push( '' );
				}
				prevLabel = this.daysLabels[ date.getUTCDay() ];
			} else {
				this.temperature[ this.temperature.length ] = Math.max( item.temperature, this.temperature[ this.temperature.length ] );
			}
			minTemperature = Math.min( item.temperature, minTemperature );
			maxTemperature = Math.max( item.temperature, maxTemperature );
			numberItemsByDay[ index ]++;
		} );
		this.data = result.filter( item => item !== null );
	},
	fetchOnServer: false,
};
</script>
<style lang="scss" scoped>
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
		font-size: 1.2em;
		padding-right: 0.5em;
	}

	.heat {
		color: rgba( 0, 0, 0, 0.6 );
	}

	.bg-primary {
		.heat {
			color: rgba( 255, 255, 255, 0.6 );
		}
	}

	.icon {
		opacity: 0.5;
		height: 48px;
	}

</style>
