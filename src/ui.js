const blessed = require('blessed')
const contrib = require('blessed-contrib')

const screen = blessed.screen()

const createEmptyList = (length, val) => Array.from({ length }, _ => val)

const getEmptyCoordinated = () => ({ x: createEmptyList(10, ' '), y: createEmptyList(10, 1) })

exports.Ui = class Ui {
  line = contrib.line({
    style: { line: 'yellow', text: 'green', baseline: 'black' },
    // xLabelPadding: 10,
    // xPadding: 5,
    label: 'Response Time (MS)',
    // legend: { width: 1 },
    showLegend: true
  })

  getRequest = { ...getEmptyCoordinated(), title: 'GET /people', style: { line: 'yellow' } }
  postRequest = { ...getEmptyCoordinated(), title: 'POST /people', style: { line: 'green' } }

  constructor() {
    this.screen = screen
    this.screen.append(this.line)
    // this.line.setData([{
    //   x: ['t1', 't2', 't3', 't4'],
    //   y: [5, 1, 7, 5],
    //   title: 'Get /people',
    //   style: { line: 'yellow', text: 'yellow'}
    // }, {
    //   x: ['t1', 't2', 't3', 't4'],
    //   y: [40, 22, 90, 49],
    //   title: 'Post /people',
    //   style: { line: 'green', text: 'green'}
    // }])
 
    // console.log('GEtREeust', this.getRequest, this.postRequest)
  }
  
  renderGraph() {
    // this.line.setData([this.getRequest, this.postRequest])
    this.line.setData([this.getRequest, this.postRequest])

    this.screen.render()
  }

  updateGraph(method, value) {
    const target = method === 'GET' ? this.getRequest : this.postRequest

    target.y.shift()
    target.y.push(value)

    this.renderGraph()
  }
}
