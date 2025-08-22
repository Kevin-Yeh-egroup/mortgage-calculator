"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Calculator, TrendingUp, Home } from "lucide-react"

export default function MortgageCalculator() {
  // 基本試算狀態
  const [housePrice, setHousePrice] = useState(8000000)
  const [downPayment, setDownPayment] = useState(1600000)
  const [interestRate, setInterestRate] = useState(2.06)
  const [loanTerm, setLoanTerm] = useState("30")
  const [customTerm, setCustomTerm] = useState(30)
  const [paymentMethod, setPaymentMethod] = useState("equal-payment")
  const [gracePeriod, setGracePeriod] = useState(0)
  // 移除這些狀態
  // const [processingFee, setProcessingFee] = useState(3000)
  // const [insurance, setInsurance] = useState(0)
  // const [monthlyInsurance, setMonthlyInsurance] = useState(0)
  const [penaltyRate, setPenaltyRate] = useState(1.0)

  // 提前還款狀態
  const [prepaymentYear, setPrepaymentYear] = useState("5")
  const [prepaymentMethod, setPrepaymentMethod] = useState("full")
  const [prepaymentAmount, setPrepaymentAmount] = useState(1000000)

  // 新青安狀態
  const [youngLoanPrice, setYoungLoanPrice] = useState(8000000)
  const [youngDownPayment, setYoungDownPayment] = useState(1600000)

  // 新增：新青安方案基準參數
  const [baseRate, setBaseRate] = useState(1.72)
  const [rateReduction, setRateReduction] = useState(0.125)
  const [govSubsidy, setGovSubsidy] = useState(0.375)
  const [maxLoanAmount, setMaxLoanAmount] = useState(10000000)
  const [maxLoanRatio, setMaxLoanRatio] = useState(80)
  const [maxLoanTerm, setMaxLoanTerm] = useState(40)
  const [maxGracePeriod, setMaxGracePeriod] = useState(5)

  // 新增：額外費用項目
  const [youngProcessingFee, setYoungProcessingFee] = useState(3000)
  const [youngSetupFee, setYoungSetupFee] = useState(0)
  const [youngAccountFee, setYoungAccountFee] = useState(300)
  const [youngAppraisalFee, setYoungAppraisalFee] = useState(3000)
  const [youngNotaryFee, setYoungNotaryFee] = useState(8000)
  const [youngInsuranceFee, setYoungInsuranceFee] = useState(2000)
  const [youngTransferFee, setYoungTransferFee] = useState(0)
  const [mortgageRegistrationFee, setMortgageRegistrationFee] = useState(6400) // 新增

  // 計算函數
  const calculateBasicLoan = () => {
    const loanAmount = housePrice - downPayment
    const actualTerm = loanTerm === "custom" ? customTerm : Number.parseInt(loanTerm)
    const monthlyRate = interestRate / 100 / 12
    const totalMonths = actualTerm * 12
    const graceMonths = gracePeriod

    let monthlyPayment = 0
    let totalInterest = 0
    let graceMonthlyPayment = 0 // 寬限期月付金
    let normalMonthlyPayment = 0 // 寬限期後月付金

    if (graceMonths > 0) {
      // 有寬限期的情況
      // 寬限期內：只繳利息
      graceMonthlyPayment = loanAmount * monthlyRate

      // 寬限期後：剩餘本金在剩餘期限內攤還
      const remainingMonths = totalMonths - graceMonths

      if (paymentMethod === "equal-payment") {
        // 本息平均攤還法
        if (monthlyRate > 0 && remainingMonths > 0) {
          normalMonthlyPayment =
            (loanAmount * (Math.pow(1 + monthlyRate, remainingMonths) * monthlyRate)) /
            (Math.pow(1 + monthlyRate, remainingMonths) - 1)
        } else {
          normalMonthlyPayment = remainingMonths > 0 ? loanAmount / remainingMonths : 0
        }
      } else {
        // 本金平均攤還法
        const monthlyPrincipal = remainingMonths > 0 ? loanAmount / remainingMonths : 0
        const firstMonthInterest = loanAmount * monthlyRate
        normalMonthlyPayment = monthlyPrincipal + firstMonthInterest
      }

      // 寬限期的總利息
      const graceInterest = graceMonthlyPayment * graceMonths

      // 寬限期後的總利息
      let normalInterest = 0
      if (paymentMethod === "equal-payment") {
        normalInterest = normalMonthlyPayment * remainingMonths - loanAmount
      } else {
        normalInterest = (loanAmount * monthlyRate * (remainingMonths + 1)) / 2
      }

      totalInterest = graceInterest + normalInterest
      monthlyPayment = normalMonthlyPayment // 顯示寬限期後的月付金
    } else {
      // 沒有寬限期的情況（原邏輯）
      if (paymentMethod === "equal-payment") {
        // 本息平均攤還法
        if (monthlyRate > 0) {
          monthlyPayment =
            (loanAmount * (Math.pow(1 + monthlyRate, totalMonths) * monthlyRate)) /
            (Math.pow(1 + monthlyRate, totalMonths) - 1)
        } else {
          monthlyPayment = loanAmount / totalMonths
        }
        totalInterest = monthlyPayment * totalMonths - loanAmount
      } else {
        // 本金平均攤還法
        const monthlyPrincipal = loanAmount / totalMonths
        const firstMonthInterest = loanAmount * monthlyRate
        monthlyPayment = monthlyPrincipal + firstMonthInterest
        totalInterest = (loanAmount * monthlyRate * (totalMonths + 1)) / 2
      }

      graceMonthlyPayment = 0
      normalMonthlyPayment = monthlyPayment
    }

    // 計算總額外費用（包含抵押權設定規費）
    const totalExtraFees =
      youngProcessingFee +
      youngSetupFee +
      youngAccountFee +
      youngAppraisalFee +
      youngNotaryFee +
      youngInsuranceFee +
      youngTransferFee +
      mortgageRegistrationFee

    const totalCost = loanAmount + totalInterest + totalExtraFees

    // 計算總費用年百分率
    const averageAnnualCost = totalCost / actualTerm
    const annualPercentageRate = (averageAnnualCost / loanAmount) * 100

    return {
      loanAmount,
      monthlyPayment,
      graceMonthlyPayment,
      normalMonthlyPayment,
      totalInterest,
      totalExtraFees,
      totalCost,
      averageAnnualCost,
      annualPercentageRate,
      hasGracePeriod: graceMonths > 0,
      graceMonths,
      remainingMonths: graceMonths > 0 ? totalMonths - graceMonths : totalMonths,
    }
  }

  // 利率壓力測試
  const calculateStressTest = () => {
    const results = []
    const baseRate = interestRate
    const loanAmount = housePrice - downPayment
    const actualTerm = loanTerm === "custom" ? customTerm : Number.parseInt(loanTerm)
    const totalMonths = actualTerm * 12

    for (let i = -4; i <= 4; i++) {
      const adjustedRate = baseRate + i * 0.25
      const monthlyRate = adjustedRate / 100 / 12

      let monthlyPayment = 0
      if (monthlyRate > 0) {
        monthlyPayment =
          (loanAmount * (Math.pow(1 + monthlyRate, totalMonths) * monthlyRate)) /
          (Math.pow(1 + monthlyRate, totalMonths) - 1)
      } else {
        monthlyPayment = loanAmount / totalMonths
      }

      const baseMonthlyPayment = calculateBasicLoan().monthlyPayment
      const difference = monthlyPayment - baseMonthlyPayment

      results.push({
        change: i * 0.25,
        adjustedRate,
        monthlyPayment,
        difference,
        isCurrent: i === 0,
      })
    }

    return results
  }

  // 提前還款計算
  const calculatePrepayment = () => {
    const loanAmount = housePrice - downPayment
    const actualTerm = loanTerm === "custom" ? customTerm : Number.parseInt(loanTerm)
    const monthlyRate = interestRate / 100 / 12
    const totalMonths = actualTerm * 12
    const prepaymentMonths = Number.parseInt(prepaymentYear) * 12

    // 計算到提前還款時點的剩餘本金
    const monthlyPayment = calculateBasicLoan().monthlyPayment
    let remainingBalance = loanAmount

    for (let i = 0; i < prepaymentMonths; i++) {
      const interestPayment = remainingBalance * monthlyRate
      const principalPayment = monthlyPayment - interestPayment
      remainingBalance -= principalPayment
    }

    const penalty = remainingBalance * (penaltyRate / 100)

    if (prepaymentMethod === "full") {
      // 全額清償
      const remainingMonths = totalMonths - prepaymentMonths
      const savedInterest = remainingMonths * monthlyPayment - remainingBalance

      return {
        remainingBalance,
        penalty,
        savedInterest,
        newMonthlyPayment: 0,
        shortenedTerm: 0,
      }
    } else if (prepaymentMethod === "partial-same-term") {
      // 部分清償-期限不變
      const newBalance = remainingBalance - prepaymentAmount
      const remainingMonths = totalMonths - prepaymentMonths
      const newMonthlyPayment =
        (newBalance * (Math.pow(1 + monthlyRate, remainingMonths) * monthlyRate)) /
        (Math.pow(1 + monthlyRate, remainingMonths) - 1)
      const savedInterest = (monthlyPayment - newMonthlyPayment) * remainingMonths

      return {
        remainingBalance,
        penalty,
        savedInterest,
        newMonthlyPayment,
        shortenedTerm: 0,
      }
    } else {
      // 部分清償-期限縮短
      const newBalance = remainingBalance - prepaymentAmount
      // 計算縮短的期限（簡化計算）
      const shortenedMonths = Math.floor(prepaymentAmount / (monthlyPayment * 0.7))
      const newTerm = totalMonths - prepaymentMonths - shortenedMonths
      const savedInterest = shortenedMonths * monthlyPayment * 0.3

      return {
        remainingBalance,
        penalty,
        savedInterest,
        newMonthlyPayment: monthlyPayment,
        shortenedTerm: Math.floor(shortenedMonths / 12),
      }
    }
  }

  // 新青安計算
  const calculateYoungLoan = () => {
    const loanAmount = Math.min(youngLoanPrice - youngDownPayment, maxLoanAmount, youngLoanPrice * (maxLoanRatio / 100))
    const totalMonths = maxLoanTerm * 12

    // 計算實際利率
    const actualRate1 = baseRate - rateReduction + govSubsidy // 一段式
    const actualRate2_1 = baseRate - rateReduction - govSubsidy // 二段式前2年
    const actualRate2_2 = baseRate - rateReduction + govSubsidy // 二段式第3年起
    const actualRate3_1 = baseRate - rateReduction - govSubsidy * 0.5 // 混合式第1年
    const actualRate3_2 = baseRate - rateReduction - govSubsidy * 0.25 // 混合式第2年
    const actualRate3_3 = baseRate - rateReduction + govSubsidy // 混合式第3年起

    // 一段式機動利率
    const rate1 = actualRate1 / 100 / 12
    const monthly1 = (loanAmount * (Math.pow(1 + rate1, totalMonths) * rate1)) / (Math.pow(1 + rate1, totalMonths) - 1)
    const totalInterest1 = monthly1 * totalMonths - loanAmount

    // 二段式機動利率
    const rate2_1 = actualRate2_1 / 100 / 12
    const rate2_2 = actualRate2_2 / 100 / 12
    const months2_1 = 24
    const months2_2 = totalMonths - 24

    const monthly2_1 =
      (loanAmount * (Math.pow(1 + rate2_1, totalMonths) * rate2_1)) / (Math.pow(1 + rate2_1, totalMonths) - 1)

    let balance2 = loanAmount
    for (let i = 0; i < months2_1; i++) {
      const interest = balance2 * rate2_1
      const principal = monthly2_1 - interest
      balance2 -= principal
    }

    const monthly2_2 =
      (balance2 * (Math.pow(1 + rate2_2, months2_2) * rate2_2)) / (Math.pow(1 + rate2_2, months2_2) - 1)
    const totalInterest2 = monthly2_1 * months2_1 + monthly2_2 * months2_2 - loanAmount

    // 混合式固定利率（簡化計算）
    const avgRate3 =
      (actualRate3_1 * 12 + actualRate3_2 * 12 + actualRate3_3 * (totalMonths - 24)) / totalMonths / 100 / 12
    const monthly3 =
      (loanAmount * (Math.pow(1 + avgRate3, totalMonths) * avgRate3)) / (Math.pow(1 + avgRate3, totalMonths) - 1)
    const totalInterest3 = monthly3 * totalMonths - loanAmount

    // 一般房貸比較 (假設2.5%利率)
    const normalRate = 2.5 / 100 / 12
    const normalMonthly =
      (loanAmount * (Math.pow(1 + normalRate, totalMonths) * normalRate)) / (Math.pow(1 + normalRate, totalMonths) - 1)
    const normalTotalInterest = normalMonthly * totalMonths - loanAmount

    // 計算總額外費用
    const totalExtraFees =
      youngProcessingFee +
      youngSetupFee +
      youngAccountFee +
      youngAppraisalFee +
      youngNotaryFee +
      youngInsuranceFee +
      youngTransferFee

    return {
      loanAmount,
      maxLoanByPrice: youngLoanPrice * (maxLoanRatio / 100),
      maxLoanByProgram: maxLoanAmount,
      actualLoanAmount: loanAmount,
      totalExtraFees,
      rates: {
        rate1: actualRate1,
        rate2_1: actualRate2_1,
        rate2_2: actualRate2_2,
        rate3_1: actualRate3_1,
        rate3_2: actualRate3_2,
        rate3_3: actualRate3_3,
      },
      option1: { monthly: monthly1, totalInterest: totalInterest1, saved: normalTotalInterest - totalInterest1 },
      option2: {
        monthly1: monthly2_1,
        monthly2: monthly2_2,
        totalInterest: totalInterest2,
        saved: normalTotalInterest - totalInterest2,
      },
      option3: { monthly: monthly3, totalInterest: totalInterest3, saved: normalTotalInterest - totalInterest3 },
      normal: { monthly: normalMonthly, totalInterest: normalTotalInterest },
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("zh-TW", {
      style: "currency",
      currency: "TWD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("zh-TW").format(Math.round(num))
  }

  const basicResults = calculateBasicLoan()
  const stressTestResults = calculateStressTest()
  const prepaymentResults = calculatePrepayment()
  const youngLoanResults = calculateYoungLoan()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">房貸計算器</h1>
          <p className="text-gray-600">專業的房貸試算工具，幫您精準規劃購屋財務</p>
        </div>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="basic" className="flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              基本試算
            </TabsTrigger>
            <TabsTrigger value="prepayment" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              提前還款試算
            </TabsTrigger>
            <TabsTrigger value="young-loan" className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              新青安房貸試算
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 輸入區域 */}
              <Card className="border-blue-200 bg-blue-50/30">
                <CardHeader className="bg-blue-100/50">
                  <CardTitle className="text-blue-700 flex items-center gap-2">
                    <span className="bg-blue-500 text-white px-2 py-1 rounded text-sm font-medium">基本設定</span>
                    貸款條件設定
                  </CardTitle>
                  <CardDescription className="text-blue-600">請輸入您的房貸相關資訊</CardDescription>
                </CardHeader>
                <CardContent className="bg-white space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="house-price">房屋成交價格</Label>
                      <Input
                        id="house-price"
                        type="number"
                        value={housePrice}
                        onChange={(e) => setHousePrice(Number(e.target.value))}
                        placeholder="8000000"
                      />
                    </div>
                    <div>
                      <Label htmlFor="down-payment">頭期款</Label>
                      <Input
                        id="down-payment"
                        type="number"
                        value={downPayment}
                        onChange={(e) => setDownPayment(Number(e.target.value))}
                        placeholder="1600000"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="interest-rate">貸款年利率 (%)</Label>
                      <Input
                        id="interest-rate"
                        type="number"
                        step="0.01"
                        value={interestRate}
                        onChange={(e) => setInterestRate(Number(e.target.value))}
                        placeholder="2.06"
                      />
                    </div>
                    <div>
                      <Label htmlFor="loan-term">貸款年期</Label>
                      <Select value={loanTerm} onValueChange={setLoanTerm}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="20">20年期</SelectItem>
                          <SelectItem value="30">30年期</SelectItem>
                          <SelectItem value="custom">其他自訂</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {loanTerm === "custom" && (
                    <div>
                      <Label htmlFor="custom-term">自訂年期</Label>
                      <Input
                        id="custom-term"
                        type="number"
                        value={customTerm}
                        onChange={(e) => setCustomTerm(Number(e.target.value))}
                        placeholder="25"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="payment-method">還款方式</Label>
                      <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="equal-payment">本息平均攤還</SelectItem>
                          <SelectItem value="equal-principal">本金平均攤還</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="grace-period">寬限期月數</Label>
                      <Input
                        id="grace-period"
                        type="number"
                        value={gracePeriod}
                        onChange={(e) => setGracePeriod(Number(e.target.value))}
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {/* 移除這些輸入框 */}
                    {/* <div>
                      <Label htmlFor="processing-fee">手續費</Label>
                      <Input ... />
                    </div> */}
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    {/* 移除這些輸入框 */}
                    {/* <div>
                      <Label htmlFor="insurance">保險費</Label>
                      <Input ... />
                    </div>
                    <div>
                      <Label htmlFor="monthly-insurance">月保險費</Label>
                      <Input ... />
                    </div> */}
                    <div>
                      <Label htmlFor="penalty-rate">違約金率 (%)</Label>
                      <Input
                        id="penalty-rate"
                        type="number"
                        step="0.1"
                        value={penaltyRate}
                        onChange={(e) => setPenaltyRate(Number(e.target.value))}
                        placeholder="1.0"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 在計算結果Card之前添加額外費用項目 */}
              {/* 額外費用項目 - 移到計算結果上方 */}
              <Card className="border-orange-200 bg-orange-50/30">
                <CardHeader className="bg-orange-100/50">
                  <CardTitle className="text-orange-700 flex items-center gap-2">
                    <span className="bg-orange-500 text-white px-2 py-1 rounded text-sm font-medium">費用項目</span>
                    房貸申辦額外費用項目
                  </CardTitle>
                  <CardDescription className="text-orange-600">
                    申辦房屋貸款時的相關費用項目（將計入總成本）
                  </CardDescription>
                </CardHeader>
                <CardContent className="bg-white">
                  <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="text-sm text-orange-700 font-medium">
                      💡 提醒：以下費用為房貸申辦時可能產生的額外成本，實際費用請以各銀行報價為準
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="young-processing-fee" className="text-sm font-medium">
                        開辦手續費
                      </Label>
                      <Input
                        id="young-processing-fee"
                        type="number"
                        value={youngProcessingFee}
                        onChange={(e) => setYoungProcessingFee(Number(e.target.value))}
                        className="border-orange-200 focus:border-orange-400"
                      />
                      <p className="text-xs text-gray-500">銀行處理貸款帳戶設立費用</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="young-setup-fee" className="text-sm font-medium">
                        設定費
                      </Label>
                      <Input
                        id="young-setup-fee"
                        type="number"
                        value={youngSetupFee}
                        onChange={(e) => setYoungSetupFee(Number(e.target.value))}
                        className="border-orange-200 focus:border-orange-400"
                      />
                      <p className="text-xs text-gray-500">抵押權設定規費</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="young-account-fee" className="text-sm font-medium">
                        帳管費
                      </Label>
                      <Input
                        id="young-account-fee"
                        type="number"
                        value={youngAccountFee}
                        onChange={(e) => setYoungAccountFee(Number(e.target.value))}
                        className="border-orange-200 focus:border-orange-400"
                      />
                      <p className="text-xs text-gray-500">貸款帳戶管理費用</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="young-appraisal-fee" className="text-sm font-medium">
                        鑑價費
                      </Label>
                      <Input
                        id="young-appraisal-fee"
                        type="number"
                        value={youngAppraisalFee}
                        onChange={(e) => setYoungAppraisalFee(Number(e.target.value))}
                        className="border-orange-200 focus:border-orange-400"
                      />
                      <p className="text-xs text-gray-500">房屋價值評估費用</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="young-notary-fee" className="text-sm font-medium">
                        代書費
                      </Label>
                      <Input
                        id="young-notary-fee"
                        type="number"
                        value={youngNotaryFee}
                        onChange={(e) => setYoungNotaryFee(Number(e.target.value))}
                        className="border-orange-200 focus:border-orange-400"
                      />
                      <p className="text-xs text-gray-500">代書處理相關程序費用</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="young-insurance-fee" className="text-sm font-medium">
                        保險費
                      </Label>
                      <Input
                        id="young-insurance-fee"
                        type="number"
                        value={youngInsuranceFee}
                        onChange={(e) => setYoungInsuranceFee(Number(e.target.value))}
                        className="border-orange-200 focus:border-orange-400"
                      />
                      <p className="text-xs text-gray-500">住宅火災及地震基本保險</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="young-transfer-fee" className="text-sm font-medium">
                        轉貸費
                      </Label>
                      <Input
                        id="young-transfer-fee"
                        type="number"
                        value={youngTransferFee}
                        onChange={(e) => setYoungTransferFee(Number(e.target.value))}
                        className="border-orange-200 focus:border-orange-400"
                      />
                      <p className="text-xs text-gray-500">前屋主未繳清貸款轉貸費用</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="mortgage-registration-fee" className="text-sm font-medium">
                        抵押權設定規費
                      </Label>
                      <Input
                        id="mortgage-registration-fee"
                        type="number"
                        value={mortgageRegistrationFee}
                        onChange={(e) => setMortgageRegistrationFee(Number(e.target.value))}
                        className="border-orange-200 focus:border-orange-400"
                      />
                      <p className="text-xs text-gray-500">地政機關收取的抵押權設定費用</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 重新整理計算結果 */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>計算結果</CardTitle>
                  <CardDescription>根據您的條件計算出的結果</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-600">貸款金額</div>
                      <div className="text-2xl font-bold text-blue-600">{formatCurrency(basicResults.loanAmount)}</div>
                      <div className="text-xs text-gray-500 mt-2 border-t pt-2">
                        <div className="font-medium mb-1">計算歷程：</div>
                        <div>房屋成交價格：{formatCurrency(housePrice)}</div>
                        <div>減：頭期款：{formatCurrency(downPayment)}</div>
                        <div className="border-t mt-1 pt-1 font-medium">
                          = {formatCurrency(housePrice)} - {formatCurrency(downPayment)} ={" "}
                          {formatCurrency(basicResults.loanAmount)}
                        </div>
                      </div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-600">每月還款金額</div>
                      {basicResults.hasGracePeriod ? (
                        <div>
                          <div className="text-lg font-bold text-green-600">
                            寬限期內：{formatCurrency(basicResults.graceMonthlyPayment)}
                          </div>
                          <div className="text-lg font-bold text-green-600">
                            寬限期後：{formatCurrency(basicResults.normalMonthlyPayment)}
                          </div>
                        </div>
                      ) : (
                        <div className="text-2xl font-bold text-green-600">
                          {formatCurrency(basicResults.monthlyPayment)}
                        </div>
                      )}
                      <div className="text-xs text-gray-500 mt-2 border-t pt-2">
                        <div className="font-medium mb-1">計算歷程：</div>
                        <div>貸款金額：{formatCurrency(basicResults.loanAmount)}</div>
                        <div>年利率：{interestRate}%</div>
                        <div>
                          月利率：{interestRate}% ÷ 12 = {(interestRate / 12).toFixed(4)}%
                        </div>
                        <div>
                          總貸款期數：{loanTerm === "custom" ? customTerm : loanTerm}年 × 12 ={" "}
                          {(loanTerm === "custom" ? customTerm : Number.parseInt(loanTerm)) * 12}期
                        </div>
                        {basicResults.hasGracePeriod && (
                          <>
                            <div>寬限期：{basicResults.graceMonths}個月</div>
                            <div>實際攤還期：{basicResults.remainingMonths}個月</div>
                            <div className="border-t mt-1 pt-1">
                              <div className="font-medium">寬限期內（還息不還本）：</div>
                              <div className="ml-2">月付金 = 貸款金額 × 月利率</div>
                              <div className="ml-2">
                                = {formatCurrency(basicResults.loanAmount)} × {(interestRate / 12).toFixed(4)}%
                              </div>
                              <div className="ml-2">= {formatCurrency(basicResults.graceMonthlyPayment)}</div>
                            </div>
                            <div className="border-t mt-1 pt-1">
                              <div className="font-medium">寬限期後（本息攤還）：</div>
                              <div className="ml-2">剩餘本金在{basicResults.remainingMonths}期內攤還</div>
                              <div className="ml-2">
                                {paymentMethod === "equal-payment" ? "本息平均攤還法計算" : "本金平均攤還法計算"}
                              </div>
                              <div className="ml-2">= {formatCurrency(basicResults.normalMonthlyPayment)}</div>
                            </div>
                          </>
                        )}
                        {!basicResults.hasGracePeriod && (
                          <div className="border-t mt-1 pt-1 font-medium">
                            {paymentMethod === "equal-payment" ? "本息平均攤還法計算" : "本金平均攤還法計算"}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-red-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-600">總利息支出</div>
                      <div className="text-xl font-bold text-red-600">{formatCurrency(basicResults.totalInterest)}</div>
                      <div className="text-xs text-gray-500 mt-2 border-t pt-2">
                        <div className="font-medium mb-1">計算歷程：</div>
                        {basicResults.hasGracePeriod ? (
                          <>
                            <div>寬限期利息：</div>
                            <div className="ml-2">
                              {formatCurrency(basicResults.graceMonthlyPayment)} × {basicResults.graceMonths}期 ={" "}
                              {formatCurrency(basicResults.graceMonthlyPayment * basicResults.graceMonths)}
                            </div>
                            <div>寬限期後利息：</div>
                            <div className="ml-2">
                              {formatCurrency(basicResults.normalMonthlyPayment)} × {basicResults.remainingMonths}期 -
                              貸款本金
                            </div>
                            <div className="ml-2">
                              = {formatCurrency(basicResults.normalMonthlyPayment * basicResults.remainingMonths)} -{" "}
                              {formatCurrency(basicResults.loanAmount)}
                            </div>
                            <div className="ml-2">
                              ={" "}
                              {formatCurrency(
                                basicResults.normalMonthlyPayment * basicResults.remainingMonths -
                                  basicResults.loanAmount,
                              )}
                            </div>
                            <div className="border-t mt-1 pt-1 font-medium">
                              總利息 = 寬限期利息 + 寬限期後利息 = {formatCurrency(basicResults.totalInterest)}
                            </div>
                          </>
                        ) : (
                          <>
                            <div>每月還款：{formatCurrency(basicResults.monthlyPayment)}</div>
                            <div>
                              還款期數：{(loanTerm === "custom" ? customTerm : Number.parseInt(loanTerm)) * 12}期
                            </div>
                            <div>
                              總還款金額：{formatCurrency(basicResults.monthlyPayment)} ×{" "}
                              {(loanTerm === "custom" ? customTerm : Number.parseInt(loanTerm)) * 12} ={" "}
                              {formatCurrency(
                                basicResults.monthlyPayment *
                                  (loanTerm === "custom" ? customTerm : Number.parseInt(loanTerm)) *
                                  12,
                              )}
                            </div>
                            <div className="border-t mt-1 pt-1 font-medium">
                              總利息 = 總還款 - 貸款本金 = {formatCurrency(basicResults.totalInterest)}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-600">總額外費用</div>
                      <div className="text-xl font-bold text-orange-600">
                        {formatCurrency(basicResults.totalExtraFees)}
                      </div>
                      <div className="text-xs text-gray-500 mt-2 border-t pt-2">
                        <div className="font-medium mb-1">計算歷程：</div>
                        <div>開辦手續費：{formatCurrency(youngProcessingFee)}</div>
                        <div>設定費：{formatCurrency(youngSetupFee)}</div>
                        <div>帳管費：{formatCurrency(youngAccountFee)}</div>
                        <div>鑑價費：{formatCurrency(youngAppraisalFee)}</div>
                        <div>代書費：{formatCurrency(youngNotaryFee)}</div>
                        <div>保險費：{formatCurrency(youngInsuranceFee)}</div>
                        <div>轉貸費：{formatCurrency(youngTransferFee)}</div>
                        <div>抵押權設定規費：{formatCurrency(mortgageRegistrationFee)}</div>
                        <div className="border-t mt-1 pt-1 font-medium">
                          總計 = {formatCurrency(basicResults.totalExtraFees)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-600">總成本</div>
                      <div className="text-3xl font-bold text-gray-800">{formatCurrency(basicResults.totalCost)}</div>
                      <div className="text-xs text-gray-500 mt-2 border-t pt-2">
                        <div className="font-medium mb-1">計算歷程：</div>
                        <div>貸款本金：{formatCurrency(basicResults.loanAmount)}</div>
                        <div>總利息支出：{formatCurrency(basicResults.totalInterest)}</div>
                        <div>總額外費用：{formatCurrency(basicResults.totalExtraFees)}</div>
                        <div className="border-t mt-1 pt-1 font-medium">
                          = {formatCurrency(basicResults.loanAmount)} + {formatCurrency(basicResults.totalInterest)} +{" "}
                          {formatCurrency(basicResults.totalExtraFees)} = {formatCurrency(basicResults.totalCost)}
                        </div>
                      </div>
                    </div>
                    <div className="bg-indigo-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-600">總費用年百分率</div>
                      <div className="text-2xl font-bold text-indigo-600">
                        {basicResults.annualPercentageRate.toFixed(3)}%
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        平均每年成本：{formatCurrency(basicResults.averageAnnualCost)}
                      </div>
                      <div className="text-xs text-gray-500 mt-2 border-t pt-2">
                        <div className="font-medium mb-1">計算歷程：</div>
                        <div>1. 計算平均每年成本：</div>
                        <div className="ml-2">總成本 ÷ 繳費年期</div>
                        <div className="ml-2">
                          = {formatCurrency(basicResults.totalCost)} ÷ {loanTerm === "custom" ? customTerm : loanTerm}年
                        </div>
                        <div className="ml-2">= {formatCurrency(basicResults.averageAnnualCost)}</div>
                        <div className="mt-1">2. 計算年百分率：</div>
                        <div className="ml-2">(平均每年成本 ÷ 貸款金額) × 100%</div>
                        <div className="ml-2">
                          = ({formatCurrency(basicResults.averageAnnualCost)} ÷{" "}
                          {formatCurrency(basicResults.loanAmount)}) × 100%
                        </div>
                        <div className="ml-2 font-medium">= {basicResults.annualPercentageRate.toFixed(3)}%</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 利率壓力測試 */}
            <Card>
              <CardHeader>
                <CardTitle>利率壓力測試</CardTitle>
                <CardDescription>利率變動對月付金的影響分析</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>利率變動</TableHead>
                      <TableHead>調整後利率</TableHead>
                      <TableHead>月付金</TableHead>
                      <TableHead>差額</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stressTestResults.map((result, index) => (
                      <TableRow
                        key={index}
                        className={result.isCurrent ? "bg-blue-50" : result.change > 0 ? "bg-red-50" : "bg-green-50"}
                      >
                        <TableCell>
                          {result.change > 0 ? "+" : ""}
                          {result.change.toFixed(2)}%
                        </TableCell>
                        <TableCell>{result.adjustedRate.toFixed(3)}%</TableCell>
                        <TableCell>{formatCurrency(result.monthlyPayment)}</TableCell>
                        <TableCell className={result.difference >= 0 ? "text-red-600" : "text-green-600"}>
                          {result.difference >= 0 ? "+" : ""}
                          {formatCurrency(result.difference)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* 還款方式比較 */}
            <Card>
              <CardHeader>
                <CardTitle>還款方式比較</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold text-lg mb-3 text-blue-600">本息平均攤還法</h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <strong>優點：</strong>
                      </div>
                      <ul className="list-disc list-inside space-y-1 text-gray-600">
                        <li>每月還款金額固定，便於財務規劃</li>
                        <li>初期還款壓力較小</li>
                      </ul>
                      <div>
                        <strong>缺點：</strong>
                      </div>
                      <ul className="list-disc list-inside space-y-1 text-gray-600">
                        <li>總利息支出較高</li>
                        <li>初期償還本金較少</li>
                      </ul>
                      <div>
                        <strong>適合對象：</strong>
                      </div>
                      <p className="text-gray-600">收入穩定、希望每月還款金額固定的借款人</p>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold text-lg mb-3 text-green-600">本金平均攤還法</h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <strong>優點：</strong>
                      </div>
                      <ul className="list-disc list-inside space-y-1 text-gray-600">
                        <li>總利息支出較少</li>
                        <li>每月償還本金固定</li>
                        <li>還款負擔逐月遞減</li>
                      </ul>
                      <div>
                        <strong>缺點：</strong>
                      </div>
                      <ul className="list-disc list-inside space-y-1 text-gray-600">
                        <li>初期還款金額較高</li>
                        <li>初期還款壓力較大</li>
                      </ul>
                      <div>
                        <strong>適合對象：</strong>
                      </div>
                      <p className="text-gray-600">收入較高、希望節省利息支出的借款人</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="prepayment" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 提前還款設定 */}
              <Card>
                <CardHeader>
                  <CardTitle>提前還款設定</CardTitle>
                  <CardDescription>設定提前還款的條件</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="prepayment-year">提前還款時間點</Label>
                    <Select value={prepaymentYear} onValueChange={setPrepaymentYear}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 20 }, (_, i) => (
                          <SelectItem key={i + 1} value={(i + 1).toString()}>
                            第{i + 1}年
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="prepayment-method">提前還款方式</Label>
                    <Select value={prepaymentMethod} onValueChange={setPrepaymentMethod}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full">全額清償</SelectItem>
                        <SelectItem value="partial-same-term">部分清償-期限不變</SelectItem>
                        <SelectItem value="partial-shorten-term">部分清償-期限縮短</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {prepaymentMethod !== "full" && (
                    <div>
                      <Label htmlFor="prepayment-amount">提前還款金額</Label>
                      <Input
                        id="prepayment-amount"
                        type="number"
                        value={prepaymentAmount}
                        onChange={(e) => setPrepaymentAmount(Number(e.target.value))}
                        placeholder="1000000"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 提前還款結果 */}
              <Card>
                <CardHeader>
                  <CardTitle>提前還款試算結果</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600">剩餘本金</div>
                    <div className="text-2xl font-bold text-blue-600">
                      {formatCurrency(prepaymentResults.remainingBalance)}
                    </div>
                  </div>

                  <div className="bg-red-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600">違約金</div>
                    <div className="text-xl font-bold text-red-600">{formatCurrency(prepaymentResults.penalty)}</div>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600">節省利息</div>
                    <div className="text-xl font-bold text-green-600">
                      {formatCurrency(prepaymentResults.savedInterest)}
                    </div>
                  </div>

                  {prepaymentMethod === "partial-same-term" && (
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-600">新月付金</div>
                      <div className="text-xl font-bold text-yellow-600">
                        {formatCurrency(prepaymentResults.newMonthlyPayment)}
                      </div>
                    </div>
                  )}

                  {prepaymentMethod === "partial-shorten-term" && prepaymentResults.shortenedTerm > 0 && (
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-600">縮短期限</div>
                      <div className="text-xl font-bold text-purple-600">{prepaymentResults.shortenedTerm}年</div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* 提前清償方法比較 */}
            <Card>
              <CardHeader>
                <CardTitle>提前清償方法比較</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold text-lg mb-3 text-blue-600">全額清償</h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <strong>優點：</strong>
                      </div>
                      <ul className="list-disc list-inside space-y-1 text-gray-600">
                        <li>完全免除後續利息負擔</li>
                        <li>無後續還款壓力</li>
                      </ul>
                      <div>
                        <strong>缺點：</strong>
                      </div>
                      <ul className="list-disc list-inside space-y-1 text-gray-600">
                        <li>需要大筆資金</li>
                        <li>可能影響資金調度</li>
                      </ul>
                      <div>
                        <strong>適合對象：</strong>
                      </div>
                      <p className="text-gray-600">資金充裕、希望完全解除房貸負擔</p>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold text-lg mb-3 text-green-600">部分清償-期限不變</h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <strong>優點：</strong>
                      </div>
                      <ul className="list-disc list-inside space-y-1 text-gray-600">
                        <li>降低每月還款金額</li>
                        <li>減輕每月財務壓力</li>
                      </ul>
                      <div>
                        <strong>缺點：</strong>
                      </div>
                      <ul className="list-disc list-inside space-y-1 text-gray-600">
                        <li>仍需長期還款</li>
                        <li>節省利息有限</li>
                      </ul>
                      <div>
                        <strong>適合對象：</strong>
                      </div>
                      <p className="text-gray-600">希望減輕每月還款壓力的借款人</p>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold text-lg mb-3 text-purple-600">部分清償-期限縮短</h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <strong>優點：</strong>
                      </div>
                      <ul className="list-disc list-inside space-y-1 text-gray-600">
                        <li>大幅節省利息支出</li>
                        <li>提早完成還款</li>
                      </ul>
                      <div>
                        <strong>缺點：</strong>
                      </div>
                      <ul className="list-disc list-inside space-y-1 text-gray-600">
                        <li>每月還款金額不變</li>
                        <li>短期財務壓力不減</li>
                      </ul>
                      <div>
                        <strong>適合對象：</strong>
                      </div>
                      <p className="text-gray-600">收入穩定、希望節省總利息的借款人</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="young-loan" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 新青安設定 */}
              <Card>
                <CardHeader>
                  <CardTitle>新青安房貸設定</CardTitle>
                  <CardDescription>青年安心成家購屋優惠貸款</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="young-house-price">房屋成交價格</Label>
                      <Input
                        id="young-house-price"
                        type="number"
                        value={youngLoanPrice}
                        onChange={(e) => setYoungLoanPrice(Number(e.target.value))}
                        placeholder="8000000"
                      />
                    </div>
                    <div>
                      <Label htmlFor="young-down-payment">頭期款</Label>
                      <Input
                        id="young-down-payment"
                        type="number"
                        value={youngDownPayment}
                        onChange={(e) => setYoungDownPayment(Number(e.target.value))}
                        placeholder="1600000"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 方案基準參數調整 */}
              <Card>
                <CardHeader>
                  <CardTitle>方案基準參數</CardTitle>
                  <CardDescription>可調整參數以試算不同情境</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="base-rate">基準利率 (%)</Label>
                      <Input
                        id="base-rate"
                        type="number"
                        step="0.01"
                        value={baseRate}
                        onChange={(e) => setBaseRate(Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="rate-reduction">減少調升 (%)</Label>
                      <Input
                        id="rate-reduction"
                        type="number"
                        step="0.001"
                        value={rateReduction}
                        onChange={(e) => setRateReduction(Number(e.target.value))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="gov-subsidy">政府補貼 (%)</Label>
                      <Input
                        id="gov-subsidy"
                        type="number"
                        step="0.001"
                        value={govSubsidy}
                        onChange={(e) => setGovSubsidy(Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="max-loan-amount">最高額度 (萬元)</Label>
                      <Input
                        id="max-loan-amount"
                        type="number"
                        value={maxLoanAmount / 10000}
                        onChange={(e) => setMaxLoanAmount(Number(e.target.value) * 10000)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="max-loan-ratio">最高成數 (%)</Label>
                      <Input
                        id="max-loan-ratio"
                        type="number"
                        value={maxLoanRatio}
                        onChange={(e) => setMaxLoanRatio(Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="max-loan-term">最長年期 (年)</Label>
                      <Input
                        id="max-loan-term"
                        type="number"
                        value={maxLoanTerm}
                        onChange={(e) => setMaxLoanTerm(Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="max-grace-period">寬限期 (年)</Label>
                      <Input
                        id="max-grace-period"
                        type="number"
                        value={maxGracePeriod}
                        onChange={(e) => setMaxGracePeriod(Number(e.target.value))}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 貸款資格檢核 */}
            <Card>
              <CardHeader>
                <CardTitle>貸款資格檢核</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded">
                    <div className="text-sm text-gray-600">申請金額</div>
                    <div className="font-semibold">{formatCurrency(youngLoanPrice - youngDownPayment)}</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <div className="text-sm text-gray-600">房價{maxLoanRatio}%上限</div>
                    <div className="font-semibold">{formatCurrency(youngLoanResults.maxLoanByPrice)}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded">
                    <div className="text-sm text-gray-600">方案額度上限</div>
                    <div className="font-semibold">{formatCurrency(youngLoanResults.maxLoanByProgram)}</div>
                  </div>
                  <div className="bg-green-50 p-3 rounded">
                    <div className="text-sm text-gray-600">實際可貸金額</div>
                    <div className="font-semibold text-green-600">
                      {formatCurrency(youngLoanResults.actualLoanAmount)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 三種計息方式比較 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-blue-600">一段式機動利率</CardTitle>
                  <CardDescription>{youngLoanResults.rates.rate1.toFixed(3)}% (全期固定)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="bg-blue-50 p-3 rounded">
                    <div className="text-sm text-gray-600">每月還款</div>
                    <div className="text-xl font-bold text-blue-600">
                      {formatCurrency(youngLoanResults.option1.monthly)}
                    </div>
                  </div>
                  <div className="text-sm">
                    <div>總利息：{formatCurrency(youngLoanResults.option1.totalInterest)}</div>
                    <div className="text-green-600">節省：{formatCurrency(youngLoanResults.option1.saved)}</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-green-600">二段式機動利率</CardTitle>
                  <CardDescription>
                    前2年{youngLoanResults.rates.rate2_1.toFixed(3)}%，第3年起
                    {youngLoanResults.rates.rate2_2.toFixed(3)}%
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="bg-green-50 p-3 rounded">
                    <div className="text-sm text-gray-600">前2年月付</div>
                    <div className="text-lg font-bold text-green-600">
                      {formatCurrency(youngLoanResults.option2.monthly1)}
                    </div>
                    <div className="text-sm text-gray-600">第3年起月付</div>
                    <div className="text-lg font-bold text-green-600">
                      {formatCurrency(youngLoanResults.option2.monthly2)}
                    </div>
                  </div>
                  <div className="text-sm">
                    <div>總利息：{formatCurrency(youngLoanResults.option2.totalInterest)}</div>
                    <div className="text-green-600">節省：{formatCurrency(youngLoanResults.option2.saved)}</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-purple-600">混合式固定利率</CardTitle>
                  <CardDescription>
                    第1年{youngLoanResults.rates.rate3_1.toFixed(3)}%，第2年{youngLoanResults.rates.rate3_2.toFixed(3)}
                    %，第3年起{youngLoanResults.rates.rate3_3.toFixed(3)}%
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="bg-purple-50 p-3 rounded">
                    <div className="text-sm text-gray-600">平均月付</div>
                    <div className="text-xl font-bold text-purple-600">
                      {formatCurrency(youngLoanResults.option3.monthly)}
                    </div>
                  </div>
                  <div className="text-sm">
                    <div>總利息：{formatCurrency(youngLoanResults.option3.totalInterest)}</div>
                    <div className="text-green-600">節省：{formatCurrency(youngLoanResults.option3.saved)}</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 新青安優缺點分析 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-green-600">新青安貸款優點</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <strong>政府利率補貼：</strong>
                        前3年利率約{youngLoanResults.rates.rate2_1.toFixed(3)}
                        %，比一般優惠房貸的2.06%更低，大幅減輕利息負擔。
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <strong>彈性還款條件：</strong>
                        貸款期限最長{maxLoanTerm}年、寬限期最長{maxGracePeriod}
                        年，大幅降低每月還款金額，減輕初期財務壓力。
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <strong>高額度支持：</strong>
                        貸款額度最高{formatCurrency(maxLoanAmount)}，增加民眾的購屋選擇，滿足不同價位需求。
                      </div>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-red-600">新青安貸款缺點</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <strong>補貼期限有限：</strong>
                        政府利率補貼期限有限，若2026年7月31日後利率調高，將會加重借款人的還款本息負擔。
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <strong>升息風險：</strong>
                        若將來升息，不只讓借款人還款更辛苦，也可能讓房市變冷，想脫手籌資金時，房子也賣不動。
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <strong>寬限期結束壓力：</strong>若{maxGracePeriod}
                        年寬限期結束後，借款人並未提高薪資或開源，要開始攤還本金與利息，會是龐大的財務壓力。
                      </div>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* 與一般房貸比較 */}
            <Card>
              <CardHeader>
                <CardTitle>與一般房貸比較</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>方案類型</TableHead>
                      <TableHead>利率</TableHead>
                      <TableHead>每月還款</TableHead>
                      <TableHead>總利息</TableHead>
                      <TableHead>節省金額</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>一般房貸</TableCell>
                      <TableCell>2.5%</TableCell>
                      <TableCell>{formatCurrency(youngLoanResults.normal.monthly)}</TableCell>
                      <TableCell>{formatCurrency(youngLoanResults.normal.totalInterest)}</TableCell>
                      <TableCell>-</TableCell>
                    </TableRow>
                    <TableRow className="bg-blue-50">
                      <TableCell>新青安一段式</TableCell>
                      <TableCell>{youngLoanResults.rates.rate1.toFixed(3)}%</TableCell>
                      <TableCell>{formatCurrency(youngLoanResults.option1.monthly)}</TableCell>
                      <TableCell>{formatCurrency(youngLoanResults.option1.totalInterest)}</TableCell>
                      <TableCell className="text-green-600">{formatCurrency(youngLoanResults.option1.saved)}</TableCell>
                    </TableRow>
                    <TableRow className="bg-green-50">
                      <TableCell>新青安二段式</TableCell>
                      <TableCell>
                        {youngLoanResults.rates.rate2_1.toFixed(3)}%→{youngLoanResults.rates.rate2_2.toFixed(3)}%
                      </TableCell>
                      <TableCell>
                        {formatCurrency(youngLoanResults.option2.monthly1)}→
                        {formatCurrency(youngLoanResults.option2.monthly2)}
                      </TableCell>
                      <TableCell>{formatCurrency(youngLoanResults.option2.totalInterest)}</TableCell>
                      <TableCell className="text-green-600">{formatCurrency(youngLoanResults.option2.saved)}</TableCell>
                    </TableRow>
                    <TableRow className="bg-purple-50">
                      <TableCell>新青安混合式</TableCell>
                      <TableCell>
                        {youngLoanResults.rates.rate3_1.toFixed(3)}%→{youngLoanResults.rates.rate3_2.toFixed(3)}%→
                        {youngLoanResults.rates.rate3_3.toFixed(3)}%
                      </TableCell>
                      <TableCell>{formatCurrency(youngLoanResults.option3.monthly)}</TableCell>
                      <TableCell>{formatCurrency(youngLoanResults.option3.totalInterest)}</TableCell>
                      <TableCell className="text-green-600">{formatCurrency(youngLoanResults.option3.saved)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* 新青安方案說明 */}
            <Card>
              <CardHeader>
                <CardTitle>新青安方案詳細說明</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">申請資格</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                    <li>借款人年齡在20歲以上，且借款人與其配偶、未成年子女均無自有住宅</li>
                    <li>家庭年收入120萬元以下（台北市150萬元以下）</li>
                    <li>購買住宅總價在新台幣1,000萬元以下</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">承作銀行</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    <Badge variant="outline">臺灣銀行</Badge>
                    <Badge variant="outline">臺灣土地銀行</Badge>
                    <Badge variant="outline">合作金庫</Badge>
                    <Badge variant="outline">第一銀行</Badge>
                    <Badge variant="outline">華南銀行</Badge>
                    <Badge variant="outline">彰化銀行</Badge>
                    <Badge variant="outline">兆豐銀行</Badge>
                    <Badge variant="outline">臺灣中小企業銀行</Badge>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">注意事項</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                    <li>本試算僅供參考，實際核貸條件以銀行審核為準</li>
                    <li>利率可能因市場變動而調整</li>
                    <li>申請前請詳閱各銀行相關規定</li>
                    <li>建議多家銀行比較，選擇最適合的方案</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* 免責聲明 */}
        <Card className="mt-8">
          <CardContent className="pt-6">
            <div className="text-center text-sm text-gray-500 space-y-2">
              <div className="font-semibold">免責聲明</div>
              <p>本計算器提供的結果僅供參考，實際貸款條件請以金融機構核定為準。</p>
              <p>利率、費用等可能因市場變動或個人條件而有所差異，申請前請詳細諮詢相關金融機構。</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
