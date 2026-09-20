import type {CompareResult} from '../../shared/types';

export default function ComparisonSummary({comparison,refs}:{comparison:CompareResult;refs:string[]}) {
  const labels=[...new Set([...comparison.a.metrics,...comparison.b.metrics].map(m=>m.label))];
  return <>
    <div className="recommendation">
      <img src="/brand/icon.svg" alt=""/>
      <div><h2>{comparison.winner==='tie'?'Two moods. Both you.':`Photo ${comparison.winner.toUpperCase()} is your vibe.`}</h2><p>{comparison.summary}</p></div>
    </div>
    {comparison.styleMatch!==undefined&&<div className="style-match-card">
      <div><h3>Your style match</h3><b>{Math.round(comparison.styleMatch)}<small>%</small></b><p>{refs.length?'Based on your references':'Overall visual style match'}</p></div>
      {refs.length>0&&<div className="style-match-photos">{refs.map((src,i)=><img key={i} src={src} alt={`Style reference ${i+1}`}/>)}</div>}
    </div>}
    <div className="paired-metrics" aria-label="Photo score comparison">
      {labels.map(label=><div className="paired-metric" key={label}>
        <strong>{label}</strong>
        <div>{(['a','b'] as const).map(key=>{
          const metric=comparison[key].metrics.find(m=>m.label===label);
          return <div className={`paired-bar photo-${key}`} key={key} title={metric?.detail}><span>{key.toUpperCase()}</span><div><i style={{width:`${metric?.score??0}%`}}/></div><b>{metric?Math.round(metric.score):'—'}</b></div>;
        })}</div>
      </div>)}
    </div>
    {comparison.source==='example'&&<p className="comparison-example">Example comparison · illustrative scores, not live AI feedback.</p>}
  </>;
}
