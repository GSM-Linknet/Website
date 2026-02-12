import type { WhatsappTemplate } from '@/services/whatsapp-template.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Edit, Eye, CheckCircle2, XCircle } from 'lucide-react';

interface TemplateCardProps {
    template: WhatsappTemplate;
    onToggle: (id: string, currentActive: boolean) => void;
    onEdit: (template: WhatsappTemplate) => void;
    onPreview: (template: WhatsappTemplate) => void;
}

export const TemplateCard = ({ template, onToggle, onEdit, onPreview }: TemplateCardProps) => {
    return (
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-shadow">
            <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-white">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <CardTitle className="text-xl flex items-center gap-2">
                            <MessageSquare className="h-5 w-5 text-blue-600" />
                            {template.name}
                        </CardTitle>
                        <CardDescription className="mt-1 font-mono text-xs">
                            {template.code}
                        </CardDescription>
                    </div>
                    <Badge
                        variant={template.active ? 'default' : 'secondary'}
                        className={`${template.active
                            ? 'bg-green-100 text-green-700 border-green-200'
                            : 'bg-gray-100 text-gray-600 border-gray-200'
                            }`}
                    >
                        {template.active ? (
                            <>
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Aktif
                            </>
                        ) : (
                            <>
                                <XCircle className="h-3 w-3 mr-1" />
                                Nonaktif
                            </>
                        )}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="pt-6">
                <div className="space-y-4">
                    {/* Content Preview */}
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                        <p className="text-sm text-slate-600 line-clamp-4 whitespace-pre-wrap">
                            {template.content}
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-2">
                        {/* Status Toggle with better styling */}
                        <div className="flex items-center gap-3 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
                            <div className="flex items-center gap-2">
                                <div
                                    className={`h-2 w-2 rounded-full transition-colors ${template.active ? 'bg-green-500' : 'bg-gray-400'
                                        }`}
                                />
                                <span className="text-sm font-medium text-slate-700">
                                    {template.active ? 'Aktif' : 'Nonaktif'}
                                </span>
                            </div>
                            <Switch
                                id={`toggle-${template.id}`}
                                checked={template.active}
                                onCheckedChange={() => onToggle(template.id, template.active)}
                                className="data-[state=checked]:bg-green-600"
                            />
                        </div>

                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => onPreview(template)}
                                className="gap-2 hover:bg-slate-50"
                            >
                                <Eye className="h-4 w-4" />
                                Preview
                            </Button>
                            <Button
                                size="sm"
                                onClick={() => onEdit(template)}
                                className="gap-2 bg-blue-600 hover:bg-blue-700"
                            >
                                <Edit className="h-4 w-4" />
                                Edit
                            </Button>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
