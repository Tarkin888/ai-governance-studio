import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { formatDate } from '@/lib/format-utils';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'json';
    
    const modelCard = await prisma.modelCard.findUnique({
      where: { card_id: params.id },
      include: {
        aiSystem: true,
      },
    });
    
    if (!modelCard) {
      return NextResponse.json(
        { error: 'Model card not found' },
        { status: 404 }
      );
    }
    
    switch (format.toLowerCase()) {
      case 'json':
        return NextResponse.json(modelCard);
      
      case 'markdown':
        const markdown = generateMarkdown(modelCard);
        return new NextResponse(markdown, {
          headers: {
            'Content-Type': 'text/markdown',
            'Content-Disposition': `attachment; filename="model-card-${modelCard.aiSystem.system_name.replace(/\s+/g, '-')}.md"`,
          },
        });
      
      case 'html':
        const html = generateHTML(modelCard);
        return new NextResponse(html, {
          headers: {
            'Content-Type': 'text/html',
            'Content-Disposition': `attachment; filename="model-card-${modelCard.aiSystem.system_name.replace(/\s+/g, '-')}.html"`,
          },
        });
      
      default:
        return NextResponse.json(
          { error: 'Invalid format. Supported formats: json, markdown, html' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error exporting model card:', error);
    return NextResponse.json(
      { error: 'Failed to export model card' },
      { status: 500 }
    );
  }
}

function generateMarkdown(modelCard: any): string {
  const { aiSystem } = modelCard;
  
  return `# Model Card: ${aiSystem.system_name}

**Version:** ${modelCard.card_version}  
**Status:** ${modelCard.status}  
**Last Updated:** ${formatDate(modelCard.last_updated)}  
**Updated By:** ${modelCard.updated_by}

---

## Model Details

**Model Name:** ${aiSystem.system_name}  
**Model Type:** ${aiSystem.ai_model_type}  
**Developer/Owner:** ${aiSystem.business_owner} (Business), ${aiSystem.technical_owner} (Technical)  
**Deployment Date:** ${aiSystem.deployment_date ? formatDate(aiSystem.deployment_date) : 'N/A'}  

### Description
${modelCard.model_details_summary || 'Not provided'}

### Architecture
${modelCard.model_architecture || 'Not provided'}

### Licence
${modelCard.licence || 'Not specified'}

### Citation
${modelCard.citation || 'Not provided'}

---

## Intended Use & Limitations

### Intended Use
${modelCard.intended_use || 'Not provided'}

### Intended Users
${modelCard.intended_users?.join(', ') || 'Not specified'}

### Deployment Contexts
${modelCard.intended_deployment_contexts || 'Not provided'}

### Out-of-Scope Uses
${modelCard.out_of_scope_uses?.map((use: string) => `- ${use}`).join('\n') || 'None specified'}

### Known Limitations
${modelCard.limitations_known?.map((limitation: string) => `- ${limitation}`).join('\n') || 'None specified'}

### Trade-offs
${modelCard.trade_offs || 'Not provided'}

---

## Training Data

### Data Description
${modelCard.training_data_description || 'Not provided'}

### Data Source
${modelCard.training_data_source || 'Not specified'}

### Dataset Size
${modelCard.training_data_size ? `${modelCard.training_data_size.toLocaleString()} samples` : 'Not specified'}

### Data Collection Methodology
${modelCard.data_collection_methodology || 'Not provided'}

### Preprocessing Steps
${modelCard.preprocessing_steps?.map((step: string) => `- ${step}`).join('\n') || 'None specified'}

### Data Labelling
${modelCard.data_labelling_approach || 'Not provided'}

### Sensitive Data Handling
${modelCard.sensitive_data_handling || 'Not provided'}

---

## Performance Metrics

### Evaluation Metrics
${modelCard.evaluation_metrics ? '```json\n' + JSON.stringify(modelCard.evaluation_metrics, null, 2) + '\n```' : 'Not provided'}

### Performance Results
${modelCard.performance_results ? '```json\n' + JSON.stringify(modelCard.performance_results, null, 2) + '\n```' : 'Not provided'}

### Benchmark Comparisons
${modelCard.benchmark_comparisons || 'Not provided'}

---

## Ethical Considerations & Fairness

### Fairness Assessment Summary
${modelCard.fairness_assessment_summary || 'Not provided'}

### Potential Risks & Harms
${modelCard.potential_risks_harms || 'Not provided'}

### Human Oversight Requirements
${modelCard.human_oversight_requirements || 'Not provided'}

### Contestability Mechanisms
${modelCard.contestability_mechanisms || 'Not provided'}

### Ethical Considerations
${modelCard.ethical_considerations || 'Not provided'}

---

## Deployment & Monitoring

### Deployment Recommendations
${modelCard.deployment_recommendations || 'Not provided'}

### Monitoring Requirements
${modelCard.monitoring_requirements || 'Not provided'}

### Monitoring Plan
${modelCard.monitoring_plan || 'Not provided'}

### Update Frequency
${modelCard.update_frequency}

### Update Triggers
${modelCard.update_triggers || 'Not provided'}

### Decommissioning Criteria
${modelCard.decommissioning_criteria || 'Not provided'}

---

## Regulatory Compliance

${modelCard.regulatory_compliance_summary || 'Not assessed'}

---

## Review & Approval

**Approved By:** ${modelCard.approved_by || 'Not yet approved'}  
**Approval Date:** ${modelCard.approval_date ? formatDate(modelCard.approval_date) : 'N/A'}  
**Reviewer Assigned:** ${modelCard.reviewer_assigned || 'Not assigned'}  

### Review Comments
${modelCard.review_comments || 'No comments'}

---

*This model card was generated on ${formatDate(new Date())}*
`;
}

function generateHTML(modelCard: any): string {
  const markdown = generateMarkdown(modelCard);
  
  // Simple markdown to HTML conversion
  let html = markdown
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/^- (.*$)/gim, '<li>$1</li>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^---$/gim, '<hr>');
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Model Card: ${modelCard.aiSystem.system_name}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      max-width: 900px;
      margin: 0 auto;
      padding: 2rem;
      color: #333;
    }
    h1 {
      color: #1e40af;
      border-bottom: 3px solid #1e40af;
      padding-bottom: 0.5rem;
    }
    h2 {
      color: #2563eb;
      margin-top: 2rem;
      border-bottom: 2px solid #e5e7eb;
      padding-bottom: 0.3rem;
    }
    h3 {
      color: #3b82f6;
      margin-top: 1.5rem;
    }
    hr {
      border: none;
      border-top: 1px solid #e5e7eb;
      margin: 2rem 0;
    }
    pre {
      background: #f3f4f6;
      padding: 1rem;
      border-radius: 0.5rem;
      overflow-x: auto;
    }
    code {
      background: #f3f4f6;
      padding: 0.2rem 0.4rem;
      border-radius: 0.25rem;
      font-size: 0.9em;
    }
    li {
      margin: 0.5rem 0;
    }
    strong {
      color: #1f2937;
    }
  </style>
</head>
<body>
  ${html}
</body>
</html>`;
}
