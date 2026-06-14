import React from 'react';
import type { SimulationParams, Trip, LifeStage, WealthDimension, CareerType } from '../../types/simulation';
import { DIMENSION_COLORS } from '../../constants/model';
import { PROFILES } from '../../constants/profiles';
import { PARAM_TOOLTIPS as T, UI_TOOLTIPS as U } from '../../constants/tooltips';
import { NumberField } from '../../ui/NumberField';
import { CheckboxField } from '../../ui/CheckboxField';
import { SelectField } from '../../ui/SelectField';
import { RangeField } from '../../ui/RangeField';
import { StackedBar } from '../../ui/StackedBar';
import { LIFESTYLE_PRESETS, PRESET_KEYS } from '../../constants/lifestylePresets';
import { calculateMonthlyPayment } from '../../engine/financial';
import { CollapsibleSection } from './CollapsibleSection';

interface Props {
  params: SimulationParams;
  onChange: (p: SimulationParams) => void;
  onSimulate: () => void;
  onMonteCarlo: () => void;
  onOptimize: () => void;
  onSensitivity: () => void;
  showExito: boolean;
  onShowExitoChange: (v: boolean) => void;
}

const LIFE_STAGES: LifeStage[] = ['20s', '30s', '40s', '50s', '60s'];
const PRIORITY_KEYS: { key: WealthDimension; abbr: string }[] = [
  { key: 'crecimiento', abbr: 'Cr' }, { key: 'bienestar', abbr: 'Bi' },
  { key: 'familia', abbr: 'Fa' }, { key: 'trabajo', abbr: 'Tr' },
  { key: 'dinero', abbr: 'Di' }, { key: 'comunidad', abbr: 'Co' },
  { key: 'aventura', abbr: 'Av' }, { key: 'servicio', abbr: 'Se' },
];

export const Sidebar: React.FC<Props> = ({ params: p, onChange, onSimulate, onMonteCarlo, onOptimize, onSensitivity, showExito, onShowExitoChange }) => {
  const set = <K extends keyof SimulationParams>(key: K, val: SimulationParams[K]) => onChange({ ...p, [key]: val });
  const setInitial = (key: string, val: number) => onChange({ ...p, initialValues: { ...p.initialValues, [key]: val } });
  const setPriority = (stage: LifeStage, key: WealthDimension, val: number) => {
    onChange({ ...p, priorities: { ...p.priorities, [stage]: { ...p.priorities[stage], [key]: val } } });
  };
  const setTrip = (idx: number, v: Partial<Trip>) => {
    const trips = [...p.trips]; trips[idx] = { ...trips[idx], ...v }; onChange({ ...p, trips });
  };
  const addTrip = () => onChange({ ...p, trips: [...p.trips, { destination: 'Nuevo', cost: 5000, age: 35, adventureImpact: 15 }] });
  const removeTrip = (idx: number) => onChange({ ...p, trips: p.trips.filter((_, i) => i !== idx) });
  const loadProfile = (name: string) => { const profile = PROFILES[name]; if (profile) onChange({ ...p, ...profile }); };
  const savingsCapacity = p.baseIncome - p.currentExpenses;

  return (
    <div className="sidebar">
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
        <button className="btn-sm" style={{ background: '#00d2ff', color: '#0f0f23', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 600 }} onClick={() => loadProfile('equilibrado')}>Balance</button>
        <button className="btn-sm" style={{ background: '#ffd700', color: '#0f0f23', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 600 }} onClick={() => loadProfile('financiero')}>Financiero</button>
        <button className="btn-sm" style={{ background: '#e74c3c', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 600 }} onClick={() => loadProfile('aventurero')}>Aventurero</button>
        <button className="btn-sm" style={{ background: '#ff6b9d', color: '#0f0f23', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 600 }} onClick={() => loadProfile('tradicional')}>Tradicional</button>
        <button className="btn-sm" style={{ background: '#1abc9c', color: '#0f0f23', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 600 }} onClick={() => loadProfile('emprendedor')}>Emprendedor</button>
        <button className="btn-sm" style={{ background: '#ff6b9d', color: '#0f0f23', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 600 }} onClick={() => loadProfile('amoroso')}>Amoroso</button>
      </div>
      <CheckboxField label="Mostrar Indice Exito" checked={showExito} onChange={onShowExitoChange} tooltip={U.showExito} />

      <CollapsibleSection title="Perfil Basico" defaultOpen>
        <NumberField label="Edad actual" value={p.currentAge} onChange={v => set('currentAge', v)} min={12} max={60} tooltip={T.currentAge} />
        <NumberField label="Simular hasta edad" value={p.endAge} onChange={v => set('endAge', v)} min={40} max={90} tooltip={T.endAge} />
        <NumberField label="Ingreso mensual ($)" value={p.baseIncome} onChange={v => set('baseIncome', v)} step={100} tooltip={T.baseIncome} />
        <NumberField label="Patrimonio inicial ($)" value={p.initialWealth} onChange={v => set('initialWealth', v)} step={1000} tooltip={T.initialWealth} />
        <NumberField label="Alquiler mensual ($)" value={p.rentAmount} onChange={v => set('rentAmount', v)} step={50} tooltip={T.rentAmount} />
        <NumberField label="Edad retiro laboral" value={p.retirementAge} onChange={v => set('retirementAge', v)} min={40} max={80} tooltip={T.retirementAge} />
      </CollapsibleSection>

      <CollapsibleSection title="Gastos y Ahorro">
        <NumberField label="Gastos basicos/mes ($)" value={p.basicExpenses} onChange={v => set('basicExpenses', v)} step={100} tooltip={T.basicExpenses} />
        <NumberField label="Gastos actuales/mes ($)" value={p.currentExpenses} onChange={v => set('currentExpenses', v)} step={100} tooltip={T.currentExpenses} />
        <NumberField label="Gastos ideales/mes ($)" value={p.idealExpenses} onChange={v => set('idealExpenses', v)} step={500} tooltip={T.idealExpenses} />
        <NumberField label="Tasa retiro segura (%)" value={p.safeWithdrawalRate * 100} onChange={v => set('safeWithdrawalRate', v / 100)} step={0.5} min={1} max={10} tooltip={T.safeWithdrawalRate} />
        <NumberField label="Meses fondo emergencia" value={p.emergencyMonths} onChange={v => set('emergencyMonths', v)} min={1} max={24} tooltip={T.emergencyMonths} />
        <NumberField label="Inflacion anual (%)" value={p.inflationRate * 100} onChange={v => set('inflationRate', v / 100)} step={0.5} min={0} max={15} tooltip={T.inflationRate} />
        <CheckboxField label="Invertir ahorros? 📈" checked={p.investSavings} onChange={v => set('investSavings', v)} tooltip="Si inviertes, tus ahorros crecen con rendimientos de mercado (~7-10%/año). Si no, se acumulan como efectivo sin crecimiento." />
        {(() => {
          const housing = p.wantsHouse
            ? calculateMonthlyPayment(p.housePrice * (1 - p.downPaymentRatio), p.mortgageRate, p.mortgageTerm)
            : p.rentAmount;
          const insurance = p.hasInsurance ? p.insurancePremium : 0;
          const car = p.wantsCar ? (calculateMonthlyPayment(p.carPrice, p.carLoanRate, 5) + p.carMaintenance) : 0;
          const children = p.childrenBirthAges.length * p.childBaseCost;
          const total = p.currentExpenses + housing + insurance + car + children;
          return (
            <div style={{ fontSize: '.7em', opacity: 0.85, background: '#1a1a3e', borderRadius: 4, padding: '6px 8px', marginTop: 4, lineHeight: 1.6 }}>
              💰 <b>Desglose mensual estimado:</b><br/>
              &nbsp;&nbsp;Gastos base: ${p.currentExpenses.toLocaleString()}<br/>
              &nbsp;&nbsp;+ {p.wantsHouse ? 'Hipoteca' : 'Alquiler'}: ${housing.toFixed(0)}<br/>
              {insurance > 0 && <>&nbsp;&nbsp;+ Seguro: ${insurance}<br/></>}
              {car > 0 && <>&nbsp;&nbsp;+ Carro: ${car.toFixed(0)}<br/></>}
              {children > 0 && <>&nbsp;&nbsp;+ Hijos ({p.childrenBirthAges.length}): ${children}<br/></>}
              &nbsp;&nbsp;<b>= Total: ${total.toFixed(0)}/mes</b><br/>
              <span style={{ color: (p.baseIncome - total) >= 0 ? '#1abc9c' : '#e74c3c' }}>
                💾 Capacidad ahorro: ${(p.baseIncome - total).toFixed(0)}/mes ({((p.baseIncome - total) / p.baseIncome * 100).toFixed(0)}%)
              </span>
            </div>
          );
        })()}
      </CollapsibleSection>

      <CollapsibleSection title="Educacion">
        <SelectField label="Nivel educativo" value={String(p.formalEducation)} options={[
          { value: '20', label: 'Secundaria' }, { value: '40', label: 'Tecnico' },
          { value: '60', label: 'Universidad' }, { value: '85', label: 'Maestria' },
        ]} onChange={v => set('formalEducation', Number(v))} tooltip={T.formalEducation} />
      </CollapsibleSection>

      <CollapsibleSection title="Salud y Seguro">
        <CheckboxField label="Seguro medico 100%?" checked={p.hasInsurance} onChange={v => set('hasInsurance', v)} tooltip={T.hasInsurance} />
        <NumberField label="Prima mensual ($)" value={p.insurancePremium} onChange={v => set('insurancePremium', v)} step={25} tooltip={T.insurancePremium} />
        <NumberField label="Edad inicio seguro" value={p.insuranceStartAge} onChange={v => set('insuranceStartAge', v)} min={18} max={65} tooltip={T.insuranceStartAge} />
      </CollapsibleSection>

      <CollapsibleSection title="Vivienda">
        <CheckboxField label="Comprar casa?" checked={p.wantsHouse} onChange={v => set('wantsHouse', v)} tooltip={T.wantsHouse} />
        <NumberField label="Edad compra" value={p.housePurchaseAge} onChange={v => set('housePurchaseAge', v)} tooltip={T.housePurchaseAge} />
        <NumberField label="Precio casa ($)" value={p.housePrice} onChange={v => set('housePrice', v)} step={10000} tooltip={T.housePrice} />
        <NumberField label="Prima (%)" value={Math.round(p.downPaymentRatio * 100)} onChange={v => set('downPaymentRatio', v / 100)} min={0} max={100} tooltip={T.downPaymentRatio} />
        <NumberField label="Tasa hipoteca (%)" value={p.mortgageRate * 100} onChange={v => set('mortgageRate', v / 100)} step={0.5} tooltip={T.mortgageRate} />
        <NumberField label="Plazo (anos)" value={p.mortgageTerm} onChange={v => set('mortgageTerm', v)} tooltip={T.mortgageTerm} />
        <NumberField label="Apreciacion inmueble (%)" value={p.propertyAppreciation * 100} onChange={v => set('propertyAppreciation', v / 100)} step={0.5} min={0} max={10} tooltip={T.propertyAppreciation} />
        {p.wantsHouse && (() => {
          const loanAmount = p.housePrice * (1 - p.downPaymentRatio);
          const downPayment = p.housePrice * p.downPaymentRatio;
          const monthly = calculateMonthlyPayment(loanAmount, p.mortgageRate, p.mortgageTerm);
          const totalPaid = monthly * p.mortgageTerm * 12;
          const totalInterest = totalPaid - loanAmount;
          return (
            <div style={{ fontSize: '.72em', opacity: 0.85, background: '#1a1a3e', borderRadius: 4, padding: '6px 8px', marginTop: 4, lineHeight: 1.5 }}>
              📊 <b>Cuota mensual: ${monthly.toFixed(0)}</b><br/>
              Prima: ${(downPayment / 1e3).toFixed(1)}K ({(p.downPaymentRatio * 100).toFixed(0)}%)<br/>
              Préstamo: ${(loanAmount / 1e3).toFixed(1)}K<br/>
              Total a pagar: ${(totalPaid / 1e3).toFixed(1)}K (intereses: ${(totalInterest / 1e3).toFixed(1)}K)
            </div>
          );
        })()}
      </CollapsibleSection>

      <CollapsibleSection title="Transporte">
        <CheckboxField label="Comprar carro?" checked={p.wantsCar} onChange={v => set('wantsCar', v)} tooltip={T.wantsCar} />
        <NumberField label="Edad compra" value={p.carPurchaseAge} onChange={v => set('carPurchaseAge', v)} tooltip={T.carPurchaseAge} />
        <NumberField label="Precio carro ($)" value={p.carPrice} onChange={v => set('carPrice', v)} step={1000} tooltip={T.carPrice} />
        <NumberField label="Tasa prestamo (%)" value={p.carLoanRate * 100} onChange={v => set('carLoanRate', v / 100)} step={0.5} tooltip={T.carLoanRate} />
        <NumberField label="Mantenimiento/mes ($)" value={p.carMaintenance} onChange={v => set('carMaintenance', v)} step={25} tooltip={T.carMaintenance} />
      </CollapsibleSection>

      <CollapsibleSection title="Familia, Pareja e Hijos">
        <CheckboxField label="Tiene pareja?" checked={p.hasPartner} onChange={v => set('hasPartner', v)} tooltip={T.hasPartner} />
        <RangeField label="Calidad relacion (0-100)" value={p.partnerQuality} onChange={v => set('partnerQuality', v)} tooltip={T.partnerQuality} />
        <NumberField label="Edad inicio relacion" value={p.partnerStartAge} onChange={v => set('partnerStartAge', v)} min={18} max={60} tooltip={T.partnerStartAge} />
        <CheckboxField label="Desea hijos?" checked={p.childrenBirthAges.length > 0} onChange={v => {
          if (v && p.childrenBirthAges.length === 0) set('childrenBirthAges', [30, 33]);
          else if (!v) set('childrenBirthAges', []);
        }} tooltip={T.childrenBirthAges} />
        {p.childrenBirthAges.length > 0 && (<>
          <NumberField label="Numero de hijos" value={p.childrenBirthAges.length} onChange={v => {
            const n = Math.max(0, Math.min(6, v));
            const base = p.childrenBirthAges[0] || 30;
            const spacing = p.childrenBirthAges.length > 1 ? p.childrenBirthAges[1] - p.childrenBirthAges[0] : 3;
            set('childrenBirthAges', Array.from({ length: n }, (_, i) => base + i * spacing));
          }} min={0} max={6} tooltip={U.numChildren} />
          <NumberField label="Edad 1er hijo" value={p.childrenBirthAges[0] || 30} onChange={v => {
            const spacing = p.childrenBirthAges.length > 1 ? p.childrenBirthAges[1] - p.childrenBirthAges[0] : 3;
            set('childrenBirthAges', p.childrenBirthAges.map((_, i) => v + i * spacing));
          }} tooltip={U.firstChildAge} />
          <NumberField label="Espaciamiento (anos)" value={p.childrenBirthAges.length > 1 ? p.childrenBirthAges[1] - p.childrenBirthAges[0] : 3} onChange={v => {
            const base = p.childrenBirthAges[0] || 30;
            set('childrenBirthAges', p.childrenBirthAges.map((_, i) => base + i * Math.max(1, v)));
          }} min={1} max={10} tooltip={U.childSpacing} />
          <NumberField label="Costo base/mes/hijo ($)" value={p.childBaseCost} onChange={v => set('childBaseCost', v)} step={50} tooltip={T.childBaseCost} />
        </>)}
      </CollapsibleSection>

      <CollapsibleSection title="Carrera">
        <SelectField label="Tipo" value={p.careerType} options={[
          { value: 'empleo', label: 'Solo empleo' }, { value: 'mixto', label: 'Empleo -> Emprendimiento' },
          { value: 'emprendimiento', label: 'Solo emprendimiento' },
        ]} onChange={v => set('careerType', v as CareerType)} tooltip={T.careerType} />
        <NumberField label="Edad emprendimiento" value={p.entrepreneurshipAge} onChange={v => set('entrepreneurshipAge', v)} tooltip={T.entrepreneurshipAge} />
        <NumberField label="Inversion inicial ($)" value={p.entrepreneurshipInvestment} onChange={v => set('entrepreneurshipInvestment', v)} step={5000} tooltip={T.entrepreneurshipInvestment} />
      </CollapsibleSection>

      <CollapsibleSection title="Viajes">
        {p.trips.map((trip, i) => (
          <div className="viaje-row" key={i}>
            <input className="dest" value={trip.destination} onChange={e => setTrip(i, { destination: e.target.value })} />
            <input type="number" value={trip.age} onChange={e => setTrip(i, { age: Number(e.target.value) })} title="Edad" />
            <input type="number" value={trip.cost} step={500} onChange={e => setTrip(i, { cost: Number(e.target.value) })} title="Costo $" />
            <button className="btn btn-sm btn-danger" onClick={() => removeTrip(i)}>x</button>
          </div>
        ))}
        <button className="btn btn-sm" onClick={addTrip}>+ Agregar viaje</button>
      </CollapsibleSection>

      <CollapsibleSection title="Prioridades por Etapa">
        {LIFE_STAGES.map(stage => (
          <div key={stage} style={{ marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
              <span style={{ fontWeight: 700, fontSize: '.8em', minWidth: 28 }}>{stage}</span>
              <select
                style={{ flex: 1, background: '#1a1a3e', color: '#c8d6e5', border: '1px solid #2a2a4a', borderRadius: 3, fontSize: '.72em', padding: '2px 4px' }}
                value={
                  PRESET_KEYS.find(k => {
                    const pr = LIFESTYLE_PRESETS[k].priorities;
                    return PRIORITY_KEYS.every(pk => p.priorities[stage][pk.key] === pr[pk.key]);
                  }) || 'custom'
                }
                onChange={e => {
                  const key = e.target.value;
                  if (key !== 'custom' && LIFESTYLE_PRESETS[key]) {
                    onChange({ ...p, priorities: { ...p.priorities, [stage]: { ...LIFESTYLE_PRESETS[key].priorities } } });
                  }
                }}
              >
                {PRESET_KEYS.map(k => (
                  <option key={k} value={k}>{LIFESTYLE_PRESETS[k].emoji} {LIFESTYLE_PRESETS[k].name}</option>
                ))}
                <option value="custom">✏️ Personalizado</option>
              </select>
            </div>
            <StackedBar
              priorities={p.priorities[stage]}
              onChange={newP => onChange({ ...p, priorities: { ...p.priorities, [stage]: newP } })}
            />
          </div>
        ))}
        <details style={{ marginTop: 4 }}>
          <summary style={{ fontSize: '.7em', opacity: 0.6, cursor: 'pointer' }}>✏️ Ajuste fino (grid numérico)</summary>
          <div className="prioridades-grid" style={{ marginTop: 4 }}>
            <div className="ph"></div>
            {PRIORITY_KEYS.map(pk => <div key={pk.key} className="ph" style={{ color: DIMENSION_COLORS[pk.key] }}>{pk.abbr}</div>)}
            {LIFE_STAGES.map(stage => (
              <React.Fragment key={stage}>
                <div className="ph">{stage}</div>
                {PRIORITY_KEYS.map(pk => (
                  <input key={pk.key} value={p.priorities[stage][pk.key]} onChange={e => setPriority(stage, pk.key, Number(e.target.value))} />
                ))}
              </React.Fragment>
            ))}
          </div>
        </details>
      </CollapsibleSection>

      <CollapsibleSection title="Valores Iniciales (0-100)">
        <RangeField label="Crecimiento" color={DIMENSION_COLORS.crecimiento} value={p.initialValues.crecimiento} onChange={v => setInitial('crecimiento', v)} tooltip={U.iniCrecimiento} />
        <RangeField label="Bienestar" color={DIMENSION_COLORS.bienestar} value={p.initialValues.bienestar} onChange={v => setInitial('bienestar', v)} tooltip={U.iniBienestar} />
        <RangeField label="Familia" color={DIMENSION_COLORS.familia} value={p.initialValues.familia} onChange={v => setInitial('familia', v)} tooltip={U.iniFamilia} />
        <RangeField label="Trabajo" color={DIMENSION_COLORS.trabajo} value={p.initialValues.trabajo} onChange={v => setInitial('trabajo', v)} tooltip={U.iniTrabajo} />
        <RangeField label="Comunidad" color={DIMENSION_COLORS.comunidad} value={p.initialValues.comunidad} onChange={v => setInitial('comunidad', v)} tooltip={U.iniComunidad} />
        <RangeField label="Aventura" color={DIMENSION_COLORS.aventura} value={p.initialValues.aventura} onChange={v => setInitial('aventura', v)} tooltip={U.iniAventura} />
        <RangeField label="Servicio" color={DIMENSION_COLORS.servicio} value={p.initialValues.servicio} onChange={v => setInitial('servicio', v)} tooltip={U.iniServicio} />
      </CollapsibleSection>

      <CollapsibleSection title="Estocastico (Aleatoriedad)">
        <CheckboxField label="Eventos aleatorios?" checked={p.stochasticEnabled} onChange={v => set('stochasticEnabled', v)} tooltip={T.stochasticEnabled} />
        <NumberField label="Semilla (seed)" value={p.randomSeed} onChange={v => set('randomSeed', v)} min={1} max={9999} tooltip={T.randomSeed} />
        <div className="field" style={{ fontSize: '.75em', opacity: 0.7, flexDirection: 'column', alignItems: 'flex-start' }}>
          <label>Eventos posibles:</label>
          <span>🏥 Enfermedad (prob sube con edad, baja con bienestar)</span>
          <span>💼 Oportunidad laboral (prob sube con comunidad)</span>
          <span>📉 Crisis de mercado (prob fija ~5%/año)</span>
          <span>🎯 Golpe de suerte (prob baja ~2%/año)</span>
          <span>💔 Rompimiento (prob sube con baja calidad pareja)</span>
          <span>💕 Nueva pareja (prob sube con comunidad)</span>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Supuestos del Modelo">
        <div style={{ fontSize: '.72em', opacity: 0.8, lineHeight: 1.4 }}>
          <b>Financieros:</b><br />- 30% flujo positivo va a emergencia<br />- Inflacion configurable<br />- Sin impuestos (ingresos netos)<br />
          - Apreciacion inmueble: configurable. Deprec carro: 15%/a<br />- Rendim: acciones 10%, bonos 5%, BR 7%, efectivo 2%<br /><br />
          <b>Ingresos:</b><br />- Emprendimiento: año1=$0, años2-3=80%, max 1.5x<br />- Empleo: base × min(1, energia)<br /><br />
          <b>Riquezas:</b><br />- Bienestar: techo -1pt/año desde 25 (min 50)<br />- Crecimiento: obsolescencia 1.8%/a base<br />
          - Trabajo: decay post-retiro. Comunidad: erosion 55+<br />- Aventura: permanente. Hijo indep a 22<br />
          - Pareja: 0.5x(toxica) a 1.3x(excelente)<br />- Entropia: &gt;85 sufre micro-decay<br /><br />
          <b>Robin Sharma</b> — The Wealth Money Cant Buy
        </div>
      </CollapsibleSection>

      <button className="btn" style={{ background: '#9b59b6', marginTop: 6 }} onClick={onMonteCarlo}>🎰 Monte Carlo (100 vidas)</button>
      <button className="btn" style={{ background: '#1abc9c', marginTop: 6 }} onClick={onSensitivity}>🔬 Análisis Multifactorial</button>
      <button className="btn" style={{ background: '#e74c3c', marginTop: 6 }} onClick={onOptimize}>🧬 CMA-ES Optimizar</button>
      <button className="btn" onClick={onSimulate}>▶ SIMULAR</button>
    </div>
  );
};
