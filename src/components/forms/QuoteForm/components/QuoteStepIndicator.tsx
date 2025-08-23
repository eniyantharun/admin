import React from 'react';
import { CheckCircle, ChevronLeft, ChevronRight, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

type FormStep = 'customer-address' | 'items' | 'quote' | 'shipping' | 'notes';

interface QuoteStepIndicatorProps {
  steps: FormStep[];
  currentStep: FormStep;
  setCurrentStep: (step: FormStep) => void;
  isStepCompleted: (step: FormStep) => boolean;
  onPrevStep: () => void;
  onNextStep: () => void;
  onSubmit: (e: React.FormEvent) => void;
  isEditing: boolean;
  loading: boolean;
}

export const QuoteStepIndicator: React.FC<QuoteStepIndicatorProps> = ({
  steps,
  currentStep,
  setCurrentStep,
  isStepCompleted,
  onPrevStep,
  onNextStep,
  onSubmit,
  isEditing,
  loading
}) => {
  const getStepTitle = (step: FormStep) => {
    switch (step) {
      case 'customer-address': return 'Customer & Address';
      case 'items': return 'Items';
      case 'quote': return 'Quote Details';
      case 'shipping': return 'Shipping';
      case 'notes': return 'Notes';
      default: return 'Quote';
    }
  };

  const handleStepClick = (step: FormStep) => {
    // For new quotes, only allow navigation if customer is selected (step 1 completed)
    if (!isEditing) {
      const customerStepIndex = steps.indexOf('customer-address');
      const targetStepIndex = steps.indexOf(step);
      
      // Only allow forward navigation if previous steps are completed
      if (targetStepIndex > customerStepIndex && !isStepCompleted('customer-address')) {
        return; // Don't allow navigation
      }
    }
    
    setCurrentStep(step);
  };

  const canGoToNextStep = () => {
    if (currentStep === 'customer-address') {
      return isStepCompleted('customer-address');
    }
    return true; // Other steps can be navigated freely
  };

  const getStepStyle = (step: FormStep) => {
    const isActive = step === currentStep;
    const isCompleted = isStepCompleted(step);
    const stepIndex = steps.indexOf(step);
    const currentIndex = steps.indexOf(currentStep);
    
    // For new quotes, disable steps that can't be accessed yet
    if (!isEditing && stepIndex > 0 && !isStepCompleted('customer-address')) {
      return 'bg-gray-100 text-gray-400 cursor-not-allowed';
    }
    
    if (isActive) {
      return 'bg-purple-500 text-white';
    } else if (isCompleted) {
      return 'bg-green-500 text-white cursor-pointer hover:bg-green-600';
    } else {
      return 'bg-gray-200 text-gray-600 cursor-pointer hover:bg-gray-300';
    }
  };

  return (
    <div className="flex items-center justify-between mb-0 bg-gray-50 p-2 rounded-lg">
      <Button
        type="button"
        onClick={onPrevStep}
        variant="secondary"
        size="sm"
        icon={loading ? Loader2 : ChevronLeft}
        iconOnly
        disabled={currentStep === 'customer-address' || loading}
        className="w-8 h-8"
      />
      
      <div className="flex items-center space-x-1 flex-1 justify-center">
        {steps.map((step, index) => {
          const isActive = step === currentStep;
          const isCompleted = isStepCompleted(step);
          const canAccess = isEditing || index === 0 || isStepCompleted('customer-address');
          
          return (
            <React.Fragment key={step}>
              <div 
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${getStepStyle(step)}`}
                onClick={() => canAccess && handleStepClick(step)}
                title={canAccess ? getStepTitle(step) : 'Complete customer selection first'}
              >
                <div className="flex items-center gap-1">
                  {isCompleted && !isActive && (
                    <CheckCircle className="w-3 h-3" />
                  )}
                  <span className="hidden sm:inline">{getStepTitle(step)}</span>
                  <span className="sm:hidden">{index + 1}</span>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-8 h-0.5 transition-colors duration-200 ${
                  isStepCompleted(steps[index]) ? 'bg-green-300' : 'bg-gray-200'
                }`} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {currentStep === 'notes' ? (
        <Button
          type="submit"
          loading={loading}
          size="sm"
          icon={loading ? Loader2 : (isEditing ? Save : CheckCircle)}
          iconOnly
          className="w-8 h-8 hover:to-indigo-700"
          title={isEditing ? "Save Quote" : "Create Quote"}
          onClick={onSubmit}
          disabled={loading}
        />
      ) : (
        <Button
          type="button"
          onClick={onNextStep}
          variant="primary"
          size="sm"
          icon={loading ? Loader2 : ChevronRight}
          iconOnly
          className="w-8 h-8"
          disabled={loading || !canGoToNextStep()}
          title={canGoToNextStep() ? "Next Step" : "Complete current step first"}
        />
      )}
    </div>
  );
};