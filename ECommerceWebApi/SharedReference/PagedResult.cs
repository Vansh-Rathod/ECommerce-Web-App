using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SharedReference
{
    public class PagedResult<T>
    {
        public int TotalCount { get; set; }
        public List<T> Items { get; set; }

        public T? CustomField1 { get; set; }
        public T? CustomField2 { get; set; }
        public T? CustomField3 { get; set; }
        public T? CustomField4 { get; set; }
        public T? CustomField5 { get; set; }
        public T? CustomField6 { get; set; }
        public T? CustomField7 { get; set; }
        public T? CustomField9 { get; set; }
        public T? CustomField10 { get; set; }
    }
}
