<template>
	<div>
		<h2>Datos de hoy</h2>
		<CRow>
			<CCol sm="4" lg="4">
				<CWidgetDropdown color="primary" :header="temperatureAverage" text="Temperatura">
					<template #default>
						<TemperatureIcon class="icon"/>
					</template>
					<template #footer>
						<CChartBarSimple
							pointed
							class="mt-3 mx-3"
							style="height:70px"
							:data-points="temperature"
							point-hover-background-color="primary"
							label="ºC"
							:labels="hoursLabels"
						/>
					</template>
				</CWidgetDropdown>
			</CCol>
			<CCol sm="4" lg="4">
				<CWidgetDropdown color="info" :header="humidityAverage" text="Humedad">
					<template #default>
						<HumidityIcon class="icon"/>
					</template>
					<template #footer>
						<CChartBarSimple
							pointed
							class="mt-3 mx-3"
							style="height:70px"
							:data-points="humidity"
							point-hover-background-color="primary"
							label="ºC"
							:labels="hoursLabels"
						/>
					</template>
				</CWidgetDropdown>
			</CCol>
			<CCol sm="4" lg="4">
				<CWidgetDropdown color="warning" :header="pressureAverage" text="Presión">
					<template #default>
						<PressureIcon class="icon"/>
					</template>
					<template #footer>
						<CChartBarSimple
							pointed
							class="mt-3 mx-3"
							style="height:70px"
							:data-points="pressure"
							point-hover-background-color="primary"
							label="ºC"
							:labels="hoursLabels"
						/>
					</template>
				</CWidgetDropdown>
			</CCol>
		</CRow>
	</div>
</template>

<script>
import { TemperatureIcon, HumidityIcon, PressureIcon } from '~/components/icons';
import { CChartBarSimple } from "../charts/index.js";

export default {
	name: "DailyWidgets",
	components: { CChartBarSimple, TemperatureIcon, HumidityIcon, PressureIcon },
	data() {
		return {
			temperature: [],
			humidity: [],
			pressure: [],
			temperatureAverage: '0',
			humidityAverage: '0',
			pressureAverage: '0',
			hoursLabels: new Array(24).fill(0).map( (value, index ) => `${ index > 10 ? '': '0' }${ index }h`),
		}
	},
	async fetch() {
		const today = new Date();
		const todayData = await this.$axios.$get(
			process.env.apiServer + `data/group-by-day?day=${ today.getDate() }&month=${ today.getMonth() }&year=${ today.getFullYear() }&average=true`
		);
		const emptyArray = ( new Array( 24 ) ).fill( 0 );
		this.temperature = [ ... emptyArray ];
		this.humidity = [ ... emptyArray ];
		this.pressure = [ ... emptyArray ];
		todayData.forEach( item => {
			this.temperature[ item.hour_of_day ] = item.temperature;
			this.humidity[ item.hour_of_day ] = item.humidity;
			this.pressure[ item.hour_of_day ] = item.pressure;
		} );
		this.temperatureAverage = ( this.temperature.reduce( (a, b) => a+b ) / todayData.length ).toFixed( 2 );
		this.humidityAverage = ( this.humidity.reduce( (a, b) => a+b ) / todayData.length ).toFixed( 2 );
		this.pressureAverage = ( this.pressure.reduce( (a, b) => a+b ) / todayData.length ).toFixed( 2 );
	},
	fetchOnServer: false,
};
</script>

<style scoped>
	.icon {
		opacity: 0.5;
		height: 48px;
	}
</style>
