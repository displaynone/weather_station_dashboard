<template>
	<div>
		<CRow>
			<CCol sm="3" lg="3">
				<CWidgetDropdown color="primary" :header="temperatureNow" text="Temperatura">
					<template #default>
						<TemperatureIcon class="icon"/>
					</template>
					<template #footer>
						<CChartBarExpert
							pointed
							class="mt-3 mx-3"
							:data-points="temperatureDatasets"
							point-hover-background-color="primary"
							label="ºC"
							:labels="hoursLabels"
							style="height: 50px"
							:options="options"
						/>
					</template>
				</CWidgetDropdown>
			</CCol>
			<CCol sm="3" lg="3">
				<CWidgetDropdown color="info" :header="humidityNow" text="Humedad">
					<template #default>
						<HumidityIcon class="icon"/>
					</template>
					<template #footer>
						<CChartBarSimple
							pointed
							class="mt-3 mx-3"
							:data-points="humidity"
							point-hover-background-color="primary"
							label="%"
							:labels="hoursLabels"
							style="height: 50px"
							:options="options"
						/>
					</template>
				</CWidgetDropdown>
			</CCol>
			<CCol sm="3" lg="3">
				<CWidgetDropdown color="warning" :header="pressureNow" text="Presión">
					<template #default>
						<PressureIcon class="icon"/>
					</template>
					<template #footer>
						<CChartBarSimple
							pointed
							class="mt-3 mx-3"
							:data-points="pressure"
							point-hover-background-color="primary"
							label="hPa"
							:labels="hoursLabels"
							style="height: 50px"
							:options="options"
						/>
					</template>
				</CWidgetDropdown>
			</CCol>
			<CCol sm="3" lg="3">
				<CWidgetDropdown color="success" :header="rainAmount[ rainType ]" text="Lluvia">
					<template #default>
						<RainHeavyIcon class="icon" v-if="rainType === 'heavy'"/>
						<RainModerateIcon class="icon" v-if="rainType === 'moderate'"/>
						<SunnyIcon class="icon" v-if="rainType === 'none'"/>
					</template>
					<template #footer>
						<CChartBarSimple
							pointed
							class="mt-3 mx-3"
							:data-points="rain"
							point-hover-background-color="primary"
							label=""
							:labels="hoursLabels"
							style="height: 50px"
							:options="{
								scales: {
									yAxes: [ {
										ticks: {
											fontColor: 'rgba( 255, 255, 255, 0.5 )',
											fontSize: 10,
											stepSize: 2,
											beginAtZero: true,
											max: 1023,
										}
									} ],
								},
							}"
						/>
					</template>
				</CWidgetDropdown>
			</CCol>
		</CRow>
	</div>
</template>

<script>
import { TemperatureIcon, HumidityIcon, PressureIcon, RainHeavyIcon, RainModerateIcon, SunnyIcon } from '~/components/icons';
import { CChartBarSimple, CChartBarExpert } from "../charts/index.js";
import { getColor } from '@coreui/utils/src'

export default {
	name: "DailyWidgets",
	components: { CChartBarSimple, CChartBarExpert, TemperatureIcon, HumidityIcon, PressureIcon, RainHeavyIcon, RainModerateIcon, SunnyIcon },
	data() {
		return {
			temperature: [],
			heatIndex: [],
			humidity: [],
			pressure: [],
			rain: [],
			temperatureNow: '0',
			humidityNow: '0',
			pressureNow: '0',
			rainNow: '0',
			hoursLabels: new Array(24).fill(0).map( (value, index ) => `${ index > 10 ? '': '0' }${ index }h`),
			todayLabel: '',
			options: {
				scales: {
					yAxes: [ {
						display: true,
						gridLines: {
							display: false,
						},
						ticks: {
							fontColor: 'rgba( 255, 255, 255, 0.5 )',
							fontSize: 10,
							stepSize: 2,
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
			rainAmount: {
				heavy: 'Mucha',
				moderate: 'Moderate',
				none: 'Nada',
			},
		};
	},
	computed: {
		temperatureDatasets: function() {
			return [
				{
					data: this.temperature,
					backgroundColor: getColor( 'rgba(0, 0, 0, 0.2)' ),
				// }, {
				// 	data: this.heatIndex,
				// 	borderColor: getColor('rgba(255, 255, 255, 0.3)'),
				// 	borderWidth: 1,
				// 	borderCapStyle: 'square',
				// 	backgroundColor: getColor( 'transparent' ),
				// 	type: 'line',
				}
			];
		},
		rainType: function() {
			if ( this.rainNow > 900 ) {
				return 'heavy';
			} else if ( this.rainNow > 700 ) {
				return 'moderate';
			}
			return 'none';
		},
		rainIcon: function() {
			if ( this.rainNow > 900 ) {
				return 'Mucha';
			} else if ( this.rainNow > 700 ) {
				return 'Moderada';
			}
			return 'Nada';
		},
	},
	async fetch() {
		const today = new Date();
		// const today = new Date( 2021, 2, 8 );
		this.todayLabel = today.toLocaleDateString('es-ES', { weekday: 'long', month: 'long', day: 'numeric' })
		const todayData = await this.$axios.$get(
			process.env.apiServer + `data/group-by-day?day=${ today.getDate() }&month=${ today.getMonth() + 1 }&year=${ today.getFullYear() }&Now=true`
		);
		this.temperature = [];
		this.humidity = [];
		this.pressure = [];
		this.rain = [];
		todayData.forEach( item => {
			this.temperature[ item.hour_of_day ] = item.temperature;
			this.heatIndex[ item.hour_of_day ] = item.heatindex;
			this.humidity[ item.hour_of_day ] = item.humidity;
			this.pressure[ item.hour_of_day ] = item.pressure;
			// 10 is minimal value
			this.rain[ item.hour_of_day ] = 1024 - item.rain; // < 300 keay rain, < 500 moderate rain, else no rain
		} );
		this.temperatureNow = ( this.temperature.slice( -1 )[0] || 0).toFixed( 1 );
		this.humidityNow = ( this.humidity.slice( -1 )[0] || 0).toFixed( 1 );
		this.pressureNow = ( this.pressure.slice( -1 )[0] || 0).toFixed( 1 );
		this.rainNow = ( this.rain.slice( -1 )[0] || 0).toFixed( 1 );
	},
	fetchOnServer: false,
};
</script>
<style lang="scss" scoped>
	.day {
		text-transform: capitalize;
		font-size: 1rem;
	}

	.now {
		font-size: 4.5rem;
		display: flex;

		small {
			font-size: 2rem;
		}
	}

	.icon {
		opacity: 0.5;
		height: 48px;
	}
</style>
