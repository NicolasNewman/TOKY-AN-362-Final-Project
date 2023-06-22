class CustomList(list):
    def __repr__(self):
        return '[' + ', '.join([v for v in self]) + ']'
    
class CustomListDict(list):
    def __repr__(self):
        return '{' + ', '.join([v for v in self]) + '}'

class CustomDictList(dict[any, list]):
    def __repr__(self):
        return f"""
        {{
            {','.join([f'{k}: {CustomList(v)}' for k,v in self.items()])}
        }}
        """