import pandas as pd
# from collections import OrderedDict

treeLayout = []
treeLayout.append({'idName': 'l:0', 'name': 'GOD'})
df = pd.read_csv("genomes_overview.txt", sep="\t")

kingdoms = sorted(df.Kingdom.unique())

for i, a in enumerate(kingdoms):
    groupDF = df.loc[df['Kingdom'] == a]
    kingdomClass = "l:0:" + str(i+1)
    treeLayout.append({'idName': kingdomClass, 'name': a})
    groups = sorted(groupDF.Group.unique())
    for j, b in enumerate(groups):
        subgroupDF = groupDF.loc[groupDF['Group'] == b]
        groupClass = kingdomClass + ":" + str(j+1)
        treeLayout.append({'idName': groupClass, 'name': b})
        subgroups = sorted(subgroupDF.SubGroup.unique())
        for k, c in enumerate(subgroups):
            organismDF = subgroupDF.loc[subgroupDF['SubGroup'] == c]
            subgroupClass = groupClass + ":" + str(k+1)
            treeLayout.append({'idName': subgroupClass, 'name': c})
            organisms = sorted(organismDF.Organism)
            for l, d in enumerate(organisms):
                organismClass = subgroupClass + ":" + str(l+1)
                treeLayout.append({'idName': organismClass, 'name': d})

print("var leaves = ", treeLayout, sep="")
