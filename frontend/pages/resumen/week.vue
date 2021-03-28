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
		<CRow class="row">
			<CCol sm="12" lg="12">
				<CWidgetDropdown color="info" header="Temperatura / Humedad">
					<template #default>
						<span>
							<TemperatureIcon class="icon"/>
							<HumidityIcon class="icon"/>
						</span>
					</template>
					<template #footer>
						<CChartBarExpert
							pointed
							class="mt-3 mx-3"
							:data-points="temperatureHumidityDatasets"
							point-hover-background-color="primary"
							label="ºC"
							style="height: 200px"
							:options="options"
						/>
					</template>
				</CWidgetDropdown>
			</CCol>
		</CRow>
	</div>
</template>

<script>
import { TemperatureIcon, HumidityIcon } from '~/components/icons';
import { CChartBarExpert } from "../charts/index.js";
import { getColor } from '@coreui/utils/src'

export default {
	name: "WeekWidgets",
	// icons: { cilCaretTop },
	components: { CChartBarExpert, TemperatureIcon, HumidityIcon },
	data() {
		return {
			data: [],
			daysLabels: [ 'Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado' ],
			temperature: [],
			humidity: [],
			options: {
				scales: {
					yAxes: [ {
						display: true,
						gridLines: {
							display: false,
						},
						ticks: {
							fontColor: 'rgba( 255, 255, 255, 0.9 )',
							fontSize: 14,
							stepSize: 5,
							beginAtZero: false,
						}
					} ],
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
		temperatureHumidityDatasets: function() {
			return [
				{
					data: this.humidity,
					borderColor: getColor( 'rgba(255, 255, 255, 0.6)' ),
					borderWidth: 3,
					borderCapStyle: 'square',
					backgroundColor: getColor( 'transparent' ),
					type: 'line',
					label: '%',
					tooltipLabelColor: getColor( 'rgba(255, 255, 255, 0.7)' ),
				}, {
					data: this.temperature,
					backgroundColor: getColor( 'rgba(0, 0, 0, 0.4)' ),
					tooltipLabelColor: getColor( 'rgba(0, 0, 0, 0.4)' ),
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
		weekData.forEach( item => {
			const date = new Date( item.createdAt );
			const index = date.getDate();
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
			result[ index ].day = date.getDate();
			if ( date.getHours() - prevHour > 4 ) {
				this.temperature.push( item.temperature );
				this.humidity.push( item.humidity );
			} else {
				this.temperature[ this.temperature.length ] = Math.max( item.temperature, this.temperature[ this.temperature.length ] );
				this.humidity[ this.humidity.length ] = Math.max( item.humidity, this.humidity[ this.humidity.length ] );
			}
			minTemperature = Math.min( item.temperature, minTemperature );
			maxTemperature = Math.max( item.temperature, maxTemperature );
			numberItemsByDay[ index ]++;
		} );
		this.humidity = this.humidity.map( item => ( item * maxTemperature / 100 ).toFixed( 2 ) );
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
