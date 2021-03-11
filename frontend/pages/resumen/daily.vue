<template>
	<div>
		<CRow>
			<CCol sm="3" lg="3">
				<CWidgetDropdown color="primary" :header="temperatureAverage" text="Temperatura">
					<template #default>
						<TemperatureIcon class="icon"/>
					</template>
					<template #footer>
						<CChartBarSimple
							pointed
							class="mt-3 mx-3"
							:data-points="temperature"
							point-hover-background-color="primary"
							label="ºC"
							:labels="hoursLabels"
							style="height: 50px"
						/>
					</template>
				</CWidgetDropdown>
			</CCol>
			<CCol sm="3" lg="3">
				<CWidgetDropdown color="info" :header="humidityAverage" text="Humedad">
					<template #default>
						<HumidityIcon class="icon"/>
					</template>
					<template #footer>
						<CChartBarSimple
							pointed
							class="mt-3 mx-3"
							:data-points="humidity"
							point-hover-background-color="primary"
							label="ºC"
							:labels="hoursLabels"
							style="height: 50px"
						/>
					</template>
				</CWidgetDropdown>
			</CCol>
			<CCol sm="3" lg="3">
				<CWidgetDropdown color="warning" :header="pressureAverage" text="Presión">
					<template #default>
						<PressureIcon class="icon"/>
					</template>
					<template #footer>
						<CChartBarSimple
							pointed
							class="mt-3 mx-3"
							:data-points="pressure"
							point-hover-background-color="primary"
							label="ºC"
							:labels="hoursLabels"
							style="height: 50px"
						/>
					</template>
				</CWidgetDropdown>
			</CCol>
			<CCol sm="3" lg="3">
				<CWidgetDropdown color="success" :header="rainAverage - 50" text="Lluvia">
					<template #default>
						<RainIcon class="icon"/>
					</template>
					<template #footer>
						<CChartBarSimple
							pointed
							class="mt-3 mx-3"
							:data-points="rain"
							point-hover-background-color="primary"
							label="ºC"
							:labels="hoursLabels"
							style="height: 50px"
						/>
					</template>
				</CWidgetDropdown>
			</CCol>
		</CRow>
	</div>
</template>

<script>
import { TemperatureIcon, HumidityIcon, PressureIcon, RainIcon } from '~/components/icons';
import { CChartBarSimple } from "../charts/index.js";

export default {
	name: "DailyWidgets",
	components: { CChartBarSimple, TemperatureIcon, HumidityIcon, PressureIcon, RainIcon },
	data() {
		return {
			temperature: [],
			humidity: [],
			pressure: [],
			rain: [],
			temperatureAverage: '0',
			humidityAverage: '0',
			pressureAverage: '0',
			rainAverage: '0',
			hoursLabels: new Array(24).fill(0).map( (value, index ) => `${ index > 10 ? '': '0' }${ index }h`),
			todayLabel: '',
		}
	},
	computed: {
		temperatureNow: function() {
			const hour = new Date().getHours();
			return this.temperature?.[ hour ] || 0;
		},
	},
	async fetch() {
		const today = new Date();
		this.todayLabel = today.toLocaleDateString('es-ES', { weekday: 'long', month: 'long', day: 'numeric' })
		const todayData = await this.$axios.$get(
			process.env.apiServer + `data/group-by-day?day=${ today.getDate() }&month=${ today.getMonth() + 1 }&year=${ today.getFullYear() }&average=true`
		);
		this.temperature = [];
		this.humidity = [];
		this.pressure = [];
		this.rain = [];
		todayData.forEach( item => {
			this.temperature[ item.hour_of_day ] = item.temperature;
			this.humidity[ item.hour_of_day ] = item.humidity;
			this.pressure[ item.hour_of_day ] = item.pressure;
			// 10 is minimal value
			this.rain[ item.hour_of_day ] = 1024 - item.rain + 50; // < 300 keay rain, < 500 moderate rain, else no rain
		} );
		console.log(this.rain);
		this.temperatureAverage = ( this.temperature.reduce( (a, b) => a + b ) / todayData.length ).toFixed( 2 );
		this.humidityAverage = ( this.humidity.reduce( (a, b) => a + b ) / todayData.length ).toFixed( 2 );
		this.pressureAverage = ( this.pressure.reduce( (a, b) => a + b ) / todayData.length ).toFixed( 2 );
		this.rainAverage = ( this.rain.reduce( (a, b) => a + b ) / todayData.length ).toFixed( 2 );
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
