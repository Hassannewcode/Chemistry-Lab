
'use client';

import React from 'react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { ElementUsageOutput } from '@/ai/flows/elementUsageFlow';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';

interface UsageChartProps {
  data: ElementUsageOutput;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col space-y-1">
            <span className="text-[0.70rem] uppercase text-muted-foreground">
              {label}
            </span>
            <span className="font-bold text-muted-foreground">
              {payload[0].payload.name}
            </span>
          </div>
          <div className="flex flex-col space-y-1">
             <span className="text-[0.70rem] uppercase text-muted-foreground">
              Percentage
            </span>
            <span className="font-bold">
              {payload[0].value}%
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};


export const UsageChart: React.FC<UsageChartProps> = ({ data }) => {
  return (
    <div className="space-y-4 mt-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{data.overview}</p>
          </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="text-base">Found In Everyday Objects</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
                {data.dailyObjects.map(item => (
                    <Badge key={item} variant="secondary">{item}</Badge>
                ))}
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="text-base">Common Uses</CardTitle>
                <CardDescription>Primary applications of this element.</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={150}>
                <BarChart data={data.usage} layout="vertical" margin={{ left: 20, right: 20 }}>
                    <XAxis type="number" hide />
                    <YAxis 
                        dataKey="name" 
                        type="category" 
                        tickLine={false} 
                        axisLine={false} 
                        tick={{ fontSize: 12, fill: 'hsl(var(--foreground))' }}
                        width={80}
                    />
                    <Tooltip cursor={{fill: 'hsl(var(--muted))'}} content={<CustomTooltip />} />
                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="text-base">Natural Sources</CardTitle>
                <CardDescription>Where this element is typically found.</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={100}>
                <BarChart data={data.sources} layout="vertical" margin={{ left: 20, right: 20 }}>
                    <XAxis type="number" hide />
                    <YAxis 
                        dataKey="name" 
                        type="category" 
                        tickLine={false} 
                        axisLine={false} 
                        tick={{ fontSize: 12, fill: 'hsl(var(--foreground))' }}
                        width={80}
                    />
                    <Tooltip cursor={{fill: 'hsl(var(--muted))'}} content={<CustomTooltip />} />
                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    </div>
  );
};
