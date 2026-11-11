const points = [
  { day: 'старт', value: 100 },
  { day: '30', value: 92 },
  { day: '60', value: 78 },
  { day: '90', value: 67 },
];

const width = 340;
const height = 176;
const padX = 18;
const padTop = 20;
const padBottom = 34;
const plotHeight = height - padTop - padBottom;

const xFor = (index: number) => padX + (index * (width - padX * 2)) / (points.length - 1);
const yFor = (value: number) => padTop + (1 - value / 100) * plotHeight;
const linePath = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${xFor(index)} ${yFor(point.value)}`).join(' ');
const areaPath = `${linePath} L ${xFor(points.length - 1)} ${padTop + plotHeight} L ${xFor(0)} ${padTop + plotHeight} Z`;

export function SurvivalChart() {
  return (
    <div className="survival-chart-wrap">
      <svg
        className="survival-chart"
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Выживаемость новичков: 100% на старте, 92% через 30 дней, 78% через 60 дней, 67% через 90 дней"
      >
        <defs>
          <linearGradient id="survival-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--lime)" stopOpacity="0.55" />
            <stop offset="100%" stopColor="var(--lime)" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {[100, 50, 0].map((value) => (
          <line
            key={value}
            x1={padX}
            x2={width - padX}
            y1={yFor(value)}
            y2={yFor(value)}
            className="chart-grid"
          />
        ))}

        <line
          x1={padX}
          x2={width - padX}
          y1={yFor(80)}
          y2={yFor(80)}
          className="chart-target"
        />
        <text x={width - padX} y={yFor(80) - 5} textAnchor="end" className="chart-target-label">
          цель 80%
        </text>

        <path d={areaPath} fill="url(#survival-fill)" />
        <path d={linePath} className="chart-line" />

        {points.map((point, index) => (
          <g key={point.day}>
            <circle cx={xFor(index)} cy={yFor(point.value)} r={4.5} className="chart-point" />
            <text
              x={xFor(index)}
              y={yFor(point.value) - 11}
              textAnchor="middle"
              className="chart-value"
            >
              {point.value}%
            </text>
            <text
              x={xFor(index)}
              y={height - 9}
              textAnchor={index === 0 ? 'start' : index === points.length - 1 ? 'end' : 'middle'}
              className="chart-day"
            >
              {point.day}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
