import pandas as pd
df = pd.read_csv(r'D:\VKU-Studying\Semester_6_2025-2026\Đồ án CN1\smart-site\data\outputs\Grid_Predictions.csv')
print(df.columns.tolist())
print(df[['Score','Score_Class','Cafe_Count']].describe())
print("\nScore_Class distribution:")
print(df['Score_Class'].value_counts())
print("\nCafe_Count >= 24:", (df['Cafe_Count'] >= 24).sum())