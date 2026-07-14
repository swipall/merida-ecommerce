import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { VariantOption } from '@/lib/swipall/types/types';

interface ProductVariantsProps { variants: VariantOption[], handleAttributeChange: (kind: string, valueId: string) => void, selectedSizeId: string, selectedColorId: string }

export default function ProductVariants({ variants, handleAttributeChange, selectedSizeId, selectedColorId }: ProductVariantsProps) {
    return (
        <div className="space-y-4">
            {variants.map((variant) => (
                <div key={variant.kind} className="space-y-3">
                    <Label className="text-sm text-muted-foreground font-semibold">
                        {variant.label}
                    </Label>
                    <RadioGroup
                        value={variant.kind === 'size' ? selectedSizeId : selectedColorId}
                        onValueChange={(value) => handleAttributeChange(variant.kind, value)}
                    >
                        <div className="grid grid-cols-4 sm:grid-cols-3 md:grid-cols-4 gap-2">
                            {variant.values.map((option) => (
                                <div key={option.key} className="flex items-center space-x-2">
                                    <RadioGroupItem
                                        value={option.key}
                                        id={option.key}
                                        className="peer sr-only"
                                    />
                                    <Label
                                        htmlFor={option.key}
                                        className="flex items-center justify-center rounded-full border-2 border-muted bg-transparent px-4 py-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:bg-accent/10 peer-data-[state=checked]:border-accent cursor-pointer transition-colors w-full"
                                    >
                                        {option.value}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </RadioGroup>
                </div>
            ))}
        </div>
    )
}