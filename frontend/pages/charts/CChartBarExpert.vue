<template>
	<CChartBar
		:datasets="computedDatasets"
		:options="computedOptions"
		:labels="labels"
	/>
</template>

<script>
import { CChartBar } from '@coreui/vue-chartjs'
import { getColor, deepObjectsMerge } from '@coreui/utils/src'

export default {
	name: 'CChartBarExpert',
	components: { CChartBar },
	props: {
		...CChartBar.props,
		backgroundColor: {
			type: String,
			default: 'rgba(0,0,0,.2)'
		},
		pointHoverBackgroundColor: String,
		dataPoints: {
			type: Array,
			default: () => [10, 22, 34, 46, 58, 70, 46, 23, 45, 78, 34, 12]
		},
		label: {
			type: String,
			default: ''
		},
		pointed: Boolean
	},
	computed: {
		extraDatasets() {
			return {
				// backgroundColor: getColor(this.backgroundColor),
				pointHoverBackgroundColor: getColor(this.pointHoverBackgroundColor),
				label: this.label,
				barPercentage: 0.5,
				categoryPercentage: 1,
			};
		},
		defaultDatasets () {
			return this.dataPoints.map( item => {
				return {
					... this.extraDatasets,
					... item,
				};
			} );
		},
		defaultOptions () {
			return {
				maintainAspectRatio: false,
				legend: {
					display: false
				},
				scales: {
					xAxes: [{
						display: false,
					}],
					yAxes: [{
						display: false
					},{
						display: false
					}]
				},
				elements: {},
			}
		},
		computedDatasets () {
			return deepObjectsMerge(this.defaultDatasets, this.datasets || {})
		},
		computedOptions () {
			return deepObjectsMerge(this.defaultOptions, JSON.parse( JSON.stringify( this.options ) ) || {})
		}
	}
}
</script>
