import moment from 'moment'

const calculateValueWriteOff = (item, model, first) => {
  const endOfWarranty = moment(item.invoice.date).add(item.warranty, 'month')

  if (first.isAfter(endOfWarranty)) {
    return calculateValueWriteOffAfterWarranty(item, model, first)
  } else {
    return calculateValueWriteOffInWarranty(item, model, first)
  }
}

const getWarrantyCheckSettings = (item, first, warrantyChecks) => {
  let from = 1,
    to = 1,
    min = 1,
    max = 0,
    found = false

  warrantyChecks.forEach(wc => {
    if (!found) {
      from = to
      min = wc.min
      max = wc.max

      to = wc.value
      if (!first.isAfter(moment(item.invoice.date).add(wc.max * item.warranty, 'month'))) {
        found = true
      }
    }
  })

  return { from, to, min, max, easing: min === 0 ? 'out' : max === 1 ? 'in' : 'inout' }
}

const easeInQuad = (t, b, c, d) => {
  t /= d
  return c * t * t + b
}

const easeOutQuad = (t, b, c, d) => {
  t /= d
  return -c * t * (t - 2) + b
}

const easeInOutQuad = (t, b, c, d) => {
  t /= d / 2
  if (t < 1) return c / 2 * t * t + b
  t--
  return -c / 2 * (t * (t - 2) - 1) + b
}

const getActualValuePartFromEasing = (item, first, settings) => {
  const part = Math.abs(moment(first).diff(moment(item.invoice.date), 'month', true)) / item.warranty

  const t = part - settings.min,
    b = 1 - settings.from,
    c = settings.from - settings.to,
    d = settings.max - settings.min

  if (settings.easing === 'in') {
    return easeInQuad(t, b, c, d)
  } else if (settings.easing === 'out') {
    return easeOutQuad(t, b, c, d)
  } else {
    return easeInOutQuad(t, b, c, d)
  }
}

const calculateValueWriteOffInWarranty = (item, model, first) => {
  let warrantyChecks = model.warrantyChecks
  warrantyChecks.sort((a, b) => (a.min < b.min ? -1 : a.min > b.min ? 1 : 0))
  const settings = getWarrantyCheckSettings(item, first, warrantyChecks)
  const part = getActualValuePartFromEasing(item, first, settings)

  return part * item.invoice.accountingCurrencyAmount
}

const calculateValueWriteOffAfterWarranty = (item, model, first) => {
  let afterWarranties = model.afterWarranty
  let warrantyChecks = model.warrantyChecks

  warrantyChecks.sort((a, b) => (a.min < b.min ? -1 : a.min > b.min ? 1 : 0))
  afterWarranties.sort((a, b) => (a.min < b.min ? -1 : a.min > b.min ? 1 : 0))

  const monthsAfterWarranty = Math.abs(
    moment(item.invoice.date)
      .add(item.warranty, 'month')
      .diff(first)
  )

  const chosen = afterWarranties.find(aw => monthsAfterWarranty >= aw.min && monthsAfterWarranty < aw.max)

  if (chosen === undefined) {
    return item.invoice.accountingCurrencyAmount * (1 - afterWarranties[afterWarranties.length - 1].value)
  } else {
    let from = warrantyChecks[warrantyChecks.length - 1].value,
      found = false

    afterWarranties.forEach(aw => {
      if (!found) {
        if (aw.value === chosen.value) {
          found = true
        } else {
          from = aw.value
        }
      }
    })

    const t = monthsAfterWarranty - chosen.min,
      b = 1 - from,
      c = from - chosen.value,
      d = chosen.max - chosen.min

    return easeInOutQuad(t, b, c, d) * item.invoice.accountingCurrencyAmount
  }
}

const calculateAdditionalCosts = (item, last) => {
  return (item.additionalCosts || [])
    .map(ac => ({ value: ac.accountingCurrencyAmount, date: moment(ac.invoiceDate) }))
    .filter(ac => ac.date.isBefore(last))
    .reduce((pr, cu) => pr + cu.value, 0)
}

const calculateAccessories = (item, last) => {
  return (item.accessories || [])
    .map(ac => ({ value: ac.accountingCurrencyAmount, date: moment(ac.invoiceDate) }))
    .filter(ac => ac.date.isBefore(last))
    .reduce(
      (pr, cu) => ({
        accessories: pr.accessories + cu.value,
        accessorryWriteOff: pr.accessorryWriteOff + cu.value * 0.8
      }),
      {
        accessories: 0,
        accessorryWriteOff: 0
      }
    )
}

const isItemSold = (item, last) => (item.sell !== undefined && item.sell.date !== undefined ? moment(item.sell.date).isBefore(last) : false)

export const calculateItemAbsolute = (item, model, month) => {
  const first = moment(`${month.substring(0, 4)}-${month.substring(4, 6)}-01`, 'YYYY-MM-DD'),
    last = first
      .clone()
      .add(1, 'month')
      .add(-1, 'day')
  console.log('absolute', month, first, last)

  const initialValue = item.invoice.accountingCurrencyAmount

  const additionalCosts = calculateAdditionalCosts(item, last)
  const { accessories, accessorryWriteOff } = calculateAccessories(item, last)

  const investment = initialValue + additionalCosts + accessories

  const investmentWriteOff = accessorryWriteOff + additionalCosts

  if (last.isBefore(item.invoice.date)) {
    return {
      initialValue: 0,
      appliedDamages: 0,
      additionalCosts: 0,
      accessories: 0,
      investment: 0,
      investmentWriteOff: 0,
      writeOff: 0,
      currentValue: 0,
      soldValue: null,
      profit: null
    }
  }
  if (!isItemSold(item, last)) {
    const valueWriteOff = calculateValueWriteOff(item, model, first),
      writeOff = investmentWriteOff + valueWriteOff,
      currentValue = investment - writeOff

    return {
      initialValue,
      appliedDamages: 0,
      additionalCosts,
      accessories,
      investment,
      investmentWriteOff,
      writeOff,
      currentValue,
      soldValue: null,
      profit: null
    }
  } else {
    const sellDate = moment(item.sell.date),
      sellAmount = item.sell.accountingCurrencyAmount
    const sellFirst = moment(`${sellDate.get('year')}-${sellDate.get('month')}-01`, 'YYYY-M-D'),
      sellLast = sellFirst
        .clone()
        .add(1, 'month')
        .add(-1, 'day')

    const valueWriteOff = calculateValueWriteOff(item, model, sellFirst),
      writeOff = investmentWriteOff + valueWriteOff,
      currentValue = investment - writeOff

    return {
      initialValue,
      appliedDamages: 0,
      additionalCosts,
      accessories,
      investment,
      investmentWriteOff,
      writeOff,
      currentValue: 0,
      soldValue: sellAmount,
      profit: sellAmount - currentValue
    }
  }
}

export const calculateItemRelative = (item, model, month) => {
  const first = moment(`${month.substring(0, 4)}-${month.substring(4, 6)}-01`, 'YYYY-MM-DD')
  const previousMonth = first
    .clone()
    .add(-1, 'month')
    .format('YYYYMM')

  const previousCalc = calculateItemAbsolute(item, model, previousMonth),
    thisCalc = calculateItemAbsolute(item, model, month)

  if (previousCalc.soldValue !== null && thisCalc.soldValue !== null) {
    return {
      previousValue: 0,
      appliedDamages: 0,
      additionalCosts: 0,
      accessories: 0,
      investment: 0,
      investmentWriteOff: 0,
      writeOff: 0,
      currentValue: 0,
      soldValue: null,
      profit: null
    }
  } else if (previousCalc.soldValue === null && thisCalc.soldValue !== null) {
    return {
      previousValue: previousCalc.currentValue,
      appliedDamages: thisCalc.appliedDamages - previousCalc.appliedDamages,
      additionalCosts: thisCalc.additionalCosts - previousCalc.additionalCosts,
      accessories: thisCalc.accessories - previousCalc.accessories,
      investment: thisCalc.investment - previousCalc.investment,
      investmentWriteOff: thisCalc.investmentWriteOff - previousCalc.investmentWriteOff,
      writeOff: thisCalc.writeOff - previousCalc.writeOff,
      currentValue: thisCalc.currentValue,
      soldValue: thisCalc.soldValue,
      profit: thisCalc.profit
    }
  } else {
    return {
      previousValue: previousCalc.currentValue,
      appliedDamages: thisCalc.appliedDamages - previousCalc.appliedDamages,
      additionalCosts: thisCalc.additionalCosts - previousCalc.additionalCosts,
      accessories: thisCalc.accessories - previousCalc.accessories,
      investment: thisCalc.investment - previousCalc.investment,
      investmentWriteOff: thisCalc.investmentWriteOff - previousCalc.investmentWriteOff,
      writeOff: thisCalc.writeOff - previousCalc.writeOff,
      currentValue: thisCalc.currentValue,
      soldValue: null,
      profit: null
    }
  }
}

export const calculateBudget = (items, models, month) => {
  let result = {
    previousValue: 0,
    previousValues: [],
    appliedDamages: 0,
    appliedDamageItems: [],
    additionalCosts: 0,
    additionalCostItems: [],
    accessories: 0,
    accessoryItems: [],
    introductionCost: 0,
    introductedItems: [],
    investment: 0,
    investedItems: [],
    investmentWriteOff: 0,
    investmentWriteOffItems: [],
    writeOff: 0,
    writtenOffItems: [],
    currentValue: 0,
    currentValues: [],
    soldValue: 0,
    soldValues: [],
    profit: 0,
    profits: []
  }

  items.forEach(item => {
    const model = models[0]
    console.log(model, item.model.valueOf())
    const res = calculateItemRelative(item, model, month)

    result.previousValue += res.previousValue
    if (res.previousValue !== 0) {
      result.previousValues.push({ title: item.title, subtitle: null, amount: res.previousValue })
    }
    result.appliedDamages += res.appliedDamages
    // if (res.previousValue !== 0) {
    //   result.previousValues.push({title: item.title, subtitle: null, amount: res.previousValue})
    // }
    result.additionalCosts += res.additionalCosts
    if (res.additionalCosts !== 0) {
      result.additionalCostItems.push({ title: item.title, subtitle: null, amount: res.additionalCosts })
    }
    result.accessories += res.accessories
    if (res.accessories !== 0) {
      result.accessoryItems.push({ title: item.title, subtitle: null, amount: res.accessories })
    }
    result.investment += res.investment
    if (res.investment !== 0) {
      result.investedItems.push({ title: item.title, subtitle: null, amount: res.investment })
    }
    result.introductionCost += res.investment - res.accessories - res.additionalCosts
    if (res.investment - res.accessories - res.additionalCosts !== 0) {
      result.introductedItems.push({ title: item.title, subtitle: null, amount: res.investment - res.accessories - res.additionalCosts })
    }
    result.investmentWriteOff += res.investmentWriteOff
    if (res.investmentWriteOff !== 0) {
      result.investmentWriteOffItems.push({ title: item.title, subtitle: null, amount: res.investmentWriteOff })
    }
    result.writeOff += res.writeOff
    if (res.writeOff !== 0) {
      result.writtenOffItems.push({ title: item.title, subtitle: null, amount: res.writeOff })
    }
    result.currentValue += res.currentValue
    if (res.currentValue !== 0) {
      result.currentValues.push({ title: item.title, subtitle: null, amount: res.currentValue })
    }
    if (res.soldValue !== null) {
      result.soldValue += res.soldValue
      if (res.soldValue !== 0) {
        result.soldValues.push({ title: item.title, subtitle: null, amount: res.soldValue })
      }
      result.profit += res.profit
      if (res.profit !== 0) {
        result.profits.push({ title: item.title, subtitle: null, amount: res.profit })
      }
    }
  })

  return result
}
