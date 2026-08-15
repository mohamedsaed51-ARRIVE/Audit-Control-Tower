const API_URL =
  'https://script.google.com/macros/s/AKfycbzbEIfr4vZWhxG_3XmzY7FxSR_rsOpCfDNxxfiZctW7iiuCfJ8WlctUUlatk5sATcpK/exec';

export async function fetchExecutiveDashboard() {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.error || 'Dashboard API returned an error');
  }

  return result.data;
}