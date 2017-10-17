import time

check = {}
with open('prokaryotes.txt') as fh:
    header = fh.readline().strip().split('\t')
    header.insert(1, 'Kingdom')
    print('\t'.join(header))
    for line in fh:
        line = line.strip()
        word = line.split('\t')
        size = word[6]
        gc = word[7]
        genes = word[14]
        proteins = word[15]
        release = word[17]
        if word[0] not in check:
            check[word[0]] = [size, gc, genes, proteins, release]
        elif word[0] in check:
            try:
                if time.strptime(check[word[0]][-1], "%Y/%m/%d") < time.strptime(release, "%Y/%m/%d"):
                    check[word[0]] = [size, gc, genes, proteins, release]
            except:
                if check[word[0]][-1] == '-':
                    check[word[0]] = [size, gc, genes, proteins, release]
                else:
                    pass


test1 = {}
with open('bacteria.txt') as fh:
    for line in fh:
        line = line.strip().split('\t')
        if line[0] in check:
            test1[line[0]] = line[:4] + check[line[0]]

for a in test1:
    print('\t'.join(test1[a]))
